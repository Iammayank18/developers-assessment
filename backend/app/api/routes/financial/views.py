import json
import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from app.api.routes.financial.models import Record
from app.api.routes.financial.schemas import (
    PaymentCreate,
    PaymentResponse,
    PaymentsListResponse,
    WorklogDetailResponse,
    WorklogsListResponse,
)
from app.api.routes.financial.service import (
    calc_earnings,
    get_pmt_data,
    get_seg_data,
    get_wl_data,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/financial", tags=["financial"])


@router.get("/worklogs/", response_model=WorklogsListResponse)
def list_worklogs(
    db: SessionDep,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Any:
    """
    List all worklogs with earnings per task.
    Optional date range filtering via start_date and end_date query params.
    """
    stmt = select(Record).where(Record.type == "worklog")

    if start_date:
        try:
            sd = datetime.fromisoformat(start_date)
            stmt = stmt.where(Record.created_at >= sd)
        except Exception:
            pass

    if end_date:
        try:
            ed = datetime.fromisoformat(end_date)
            stmt = stmt.where(Record.created_at <= ed)
        except Exception:
            pass

    stmt = stmt.order_by(Record.created_at.desc())
    wls = db.exec(stmt).all()

    result = []
    for wl in wls:
        try:
            d = get_wl_data(wl)
            e = calc_earnings(db, wl.id)
            result.append({
                "id": wl.id,
                "task_name": d["task_name"],
                "freelancer_name": d["freelancer_name"],
                "freelancer_email": d["freelancer_email"],
                "hourly_rate": d["hourly_rate"],
                "status": d["status"],
                "description": d["description"],
                "total_hours": e["total_hours"],
                "total_earned": e["total_earned"],
                "created_at": wl.created_at.isoformat(),
            })
        except Exception as exc:
            logger.error(f"Failed to process worklog {wl.id}: {exc}")
            continue

    return {"data": result, "count": len(result)}


@router.get("/worklogs/{id}", response_model=WorklogDetailResponse)
def get_worklog(db: SessionDep, id: uuid.UUID) -> Any:
    """
    Get worklog detail with time segments.
    """
    wl = db.exec(select(Record).where(Record.id == id, Record.type == "worklog")).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Worklog not found")

    d = get_wl_data(wl)
    e = calc_earnings(db, wl.id)

    segs = db.exec(
        select(Record).where(Record.type == "segment", Record.parent_id == wl.id)
    ).all()

    seg_list = []
    for s in segs:
        try:
            s_d = get_seg_data(s)
            seg_list.append({
                "id": s.id,
                "start_time": s_d["start_time"],
                "end_time": s_d["end_time"],
                "hours": s_d["hours"],
                "description": s_d["description"],
            })
        except Exception as exc:
            logger.error(f"Failed to process segment {s.id}: {exc}")
            continue

    return {
        "id": wl.id,
        "task_name": d["task_name"],
        "freelancer_name": d["freelancer_name"],
        "freelancer_email": d["freelancer_email"],
        "hourly_rate": d["hourly_rate"],
        "status": d["status"],
        "description": d["description"],
        "total_hours": e["total_hours"],
        "total_earned": e["total_earned"],
        "created_at": wl.created_at.isoformat(),
        "segments": seg_list,
    }


@router.post("/payments/", response_model=PaymentResponse, status_code=201)
def create_payment(db: SessionDep, payload: PaymentCreate) -> Any:
    """
    Create payment batch from selected worklog IDs.
    Marks worklogs as paid.
    """
    t_amt = 0.0
    valid_wl_ids = []

    for wl_id in payload.wl_ids:
        wl = db.exec(
            select(Record).where(Record.id == wl_id, Record.type == "worklog")
        ).first()
        if not wl:
            raise HTTPException(status_code=404, detail=f"Worklog {wl_id} not found")

        d = get_wl_data(wl)
        if d["status"] == "paid":
            raise HTTPException(status_code=400, detail=f"Worklog {wl_id} already paid")

        e = calc_earnings(db, wl_id)
        t_amt += e["total_earned"]
        valid_wl_ids.append(wl_id)

    now = datetime.utcnow()
    pmt_data = json.dumps({
        "total_amount": round(t_amt, 2),
        "status": "confirmed",
        "paid_at": now.isoformat(),
        "notes": payload.notes,
    })

    pmt = Record(
        id=uuid.uuid4(),
        type="payment",
        parent_id=None,
        data=pmt_data,
        created_at=now,
    )
    db.add(pmt)
    db.commit()

    for wl_id in valid_wl_ids:
        wl = db.exec(select(Record).where(Record.id == wl_id)).first()
        d = json.loads(wl.data)
        d["status"] = "paid"
        wl.data = json.dumps(d)
        db.commit()

        link = Record(
            id=uuid.uuid4(),
            type="payment_link",
            parent_id=pmt.id,
            data=json.dumps({"worklog_id": str(wl_id)}),
            created_at=now,
        )
        db.add(link)
        db.commit()

    return {
        "id": pmt.id,
        "total_amount": round(t_amt, 2),
        "status": "confirmed",
        "paid_at": now.isoformat(),
        "notes": payload.notes,
        "created_at": pmt.created_at.isoformat(),
        "worklog_ids": valid_wl_ids,
    }


@router.get("/payments/", response_model=PaymentsListResponse)
def list_payments(db: SessionDep) -> Any:
    """
    List all payments.
    """
    pmts = db.exec(
        select(Record).where(Record.type == "payment").order_by(Record.created_at.desc())
    ).all()

    result = []
    for p in pmts:
        try:
            d = get_pmt_data(p)
            links = db.exec(
                select(Record).where(Record.type == "payment_link", Record.parent_id == p.id)
            ).all()
            wl_ids = []
            for lk in links:
                try:
                    lk_d = json.loads(lk.data)
                    wl_ids.append(uuid.UUID(lk_d["worklog_id"]))
                except Exception:
                    continue

            result.append({
                "id": p.id,
                "total_amount": d["total_amount"],
                "status": d["status"],
                "paid_at": d["paid_at"],
                "notes": d["notes"],
                "created_at": p.created_at.isoformat(),
                "worklog_ids": wl_ids,
            })
        except Exception as exc:
            logger.error(f"Failed to process payment {p.id}: {exc}")
            continue

    return {"data": result, "count": len(result)}


@router.get("/payments/{id}", response_model=PaymentResponse)
def get_payment(db: SessionDep, id: uuid.UUID) -> Any:
    """
    Get payment detail with associated worklogs.
    """
    pmt = db.exec(
        select(Record).where(Record.id == id, Record.type == "payment")
    ).first()
    if not pmt:
        raise HTTPException(status_code=404, detail="Payment not found")

    d = get_pmt_data(pmt)
    links = db.exec(
        select(Record).where(Record.type == "payment_link", Record.parent_id == pmt.id)
    ).all()
    wl_ids = []
    for lk in links:
        try:
            lk_d = json.loads(lk.data)
            wl_ids.append(uuid.UUID(lk_d["worklog_id"]))
        except Exception:
            continue

    return {
        "id": pmt.id,
        "total_amount": d["total_amount"],
        "status": d["status"],
        "paid_at": d["paid_at"],
        "notes": d["notes"],
        "created_at": pmt.created_at.isoformat(),
        "worklog_ids": wl_ids,
    }
