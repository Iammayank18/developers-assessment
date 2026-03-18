import json
import logging
import uuid
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.api.routes.financial.models import Record
from app.core.db import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FREELANCERS = [
    {"name": "Alice Johnson", "email": "alice@example.com", "rate": 75.0},
    {"name": "Bob Smith", "email": "bob@example.com", "rate": 90.0},
    {"name": "Carol Williams", "email": "carol@example.com", "rate": 60.0},
    {"name": "David Brown", "email": "david@example.com", "rate": 85.0},
]

TASKS = [
    "API Integration",
    "Frontend Dashboard",
    "Database Migration",
    "Authentication Module",
    "Report Generator",
    "Email Service",
    "Search Feature",
    "Payment Gateway",
    "User Onboarding",
    "Performance Optimization",
]


def seed_worklogs() -> None:
    with Session(engine) as db:
        existing = db.exec(select(Record).where(Record.type == "worklog")).first()
        if existing:
            logger.info("Worklogs already seeded, skipping.")
            return

        now = datetime.utcnow()
        wl_idx = 0

        for f in FREELANCERS:
            num_wls = 3 if wl_idx < 4 else 2
            for i in range(num_wls):
                task = TASKS[wl_idx % len(TASKS)]
                status = "pending" if wl_idx % 3 != 0 else "paid"

                wl_data = json.dumps({
                    "task_name": task,
                    "freelancer_name": f["name"],
                    "freelancer_email": f["email"],
                    "hourly_rate": f["rate"],
                    "status": status,
                    "description": f"Work on {task} by {f['name']}",
                })

                wl = Record(
                    id=uuid.uuid4(),
                    type="worklog",
                    parent_id=None,
                    data=wl_data,
                    created_at=now - timedelta(days=50 - wl_idx * 5),
                )
                db.add(wl)
                db.commit()

                base_day = now - timedelta(days=50 - wl_idx * 5)
                for s_idx in range(3 + (wl_idx % 3)):
                    start = base_day + timedelta(hours=9 + s_idx * 2)
                    hrs = 1.5 + (s_idx % 3) * 0.5
                    end = start + timedelta(hours=hrs)

                    seg_data = json.dumps({
                        "start_time": start.isoformat(),
                        "end_time": end.isoformat(),
                        "hours": hrs,
                        "description": f"Session {s_idx + 1} for {task}",
                    })

                    seg = Record(
                        id=uuid.uuid4(),
                        type="segment",
                        parent_id=wl.id,
                        data=seg_data,
                        created_at=start,
                    )
                    db.add(seg)
                    db.commit()

                wl_idx += 1

        logger.info(f"Seeded {wl_idx} worklogs with time segments.")


if __name__ == "__main__":
    seed_worklogs()
