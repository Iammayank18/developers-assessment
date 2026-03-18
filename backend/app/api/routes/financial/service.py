import json
import logging

from sqlmodel import Session, select

from app.api.routes.financial.models import Record

logger = logging.getLogger(__name__)


def get_wl_data(rec: Record) -> dict:
    """
    rec: a worklog Record
    Parse JSON data with safe defaults.
    """
    try:
        d = json.loads(rec.data)
        return {
            "task_name": d.get("task_name", ""),
            "freelancer_name": d.get("freelancer_name", ""),
            "freelancer_email": d.get("freelancer_email", ""),
            "hourly_rate": float(d.get("hourly_rate", 0)),
            "status": d.get("status", "pending"),
            "description": d.get("description", ""),
        }
    except Exception:
        return {
            "task_name": "",
            "freelancer_name": "",
            "freelancer_email": "",
            "hourly_rate": 0.0,
            "status": "pending",
            "description": "",
        }


def get_seg_data(rec: Record) -> dict:
    """
    rec: a segment Record
    Parse JSON data with safe defaults.
    """
    try:
        d = json.loads(rec.data)
        return {
            "start_time": d.get("start_time", ""),
            "end_time": d.get("end_time", ""),
            "hours": float(d.get("hours", 0)),
            "description": d.get("description", ""),
        }
    except Exception:
        return {
            "start_time": "",
            "end_time": "",
            "hours": 0.0,
            "description": "",
        }


def get_pmt_data(rec: Record) -> dict:
    """
    rec: a payment Record
    Parse JSON data with safe defaults.
    """
    try:
        d = json.loads(rec.data)
        return {
            "total_amount": float(d.get("total_amount", 0)),
            "status": d.get("status", "confirmed"),
            "paid_at": d.get("paid_at", ""),
            "notes": d.get("notes", ""),
        }
    except Exception:
        return {
            "total_amount": 0.0,
            "status": "confirmed",
            "paid_at": "",
            "notes": "",
        }


def calc_earnings(db: Session, wl_id) -> dict:
    """
    db: database session
    wl_id: worklog record id
    Query segments, sum hours * rate in Python.
    Returns dict with total_hours and total_earned.
    """
    try:
        wl = db.exec(select(Record).where(Record.id == wl_id)).first()
        if not wl:
            return {"total_hours": 0.0, "total_earned": 0.0}

        wl_d = get_wl_data(wl)
        rt = wl_d["hourly_rate"]

        segs = db.exec(
            select(Record).where(Record.type == "segment", Record.parent_id == wl_id)
        ).all()

        t_hrs = 0.0
        for s in segs:
            s_d = get_seg_data(s)
            t_hrs += s_d["hours"]

        t_earned = t_hrs * rt
        return {"total_hours": round(t_hrs, 2), "total_earned": round(t_earned, 2)}
    except Exception:
        return {"total_hours": 0.0, "total_earned": 0.0}
