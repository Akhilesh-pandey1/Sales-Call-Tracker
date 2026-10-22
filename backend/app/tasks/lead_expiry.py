from datetime import datetime, timezone
import sys

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask

from backend.app.config.base import LEAD_EXPIRY_INTERVAL_HOURS
from backend.app.extensions import db
from backend.app.modules.leads import release_expired_bookings


def run_lead_expiry_job(app: Flask) -> None:
    with app.app_context():
        release_expired_bookings()
        db.session.commit()


def start_lead_expiry_scheduler(app: Flask) -> None:
    if app.config.get("TESTING") or "pytest" in sys.modules:
        return

    scheduler_timezone: str = "UTC"
    scheduler_job_id: str = "lead_expiry_job"
    scheduler_extension_key: str = "lead_expiry_scheduler"
    first_run_time: datetime = datetime.now(timezone.utc)
    expiry_scheduler: BackgroundScheduler = BackgroundScheduler(
        timezone=scheduler_timezone
    )
    expiry_scheduler.add_job(
        run_lead_expiry_job,
        trigger="interval",
        hours=LEAD_EXPIRY_INTERVAL_HOURS,
        next_run_time=first_run_time,
        args=[app],
        id=scheduler_job_id,
    )
    expiry_scheduler.start()
    app.extensions[scheduler_extension_key] = expiry_scheduler
