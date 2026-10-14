from datetime import datetime, timedelta, timezone
from backend.app.config.base import MAX_LEAD_ATTEMPTS, RETRY_LOCK_HOURS
from backend.app.modules.leads.models import Lead


def resolve_lead_for_call(
    phone_number: str,
    duration_seconds: int,
    call_time: datetime,
) -> None:
    target_lead: Lead | None = Lead.query.filter_by(phone_number=phone_number).first()
    if target_lead is None:
        return

    connected_threshold: int = 0
    waiting_status: str = "waiting"
    done_status: str = "done"
    stopped_status: str = "stopped"

    if duration_seconds > connected_threshold:
        target_lead.status = done_status
        target_lead.claimed_by = None
        target_lead.claimed_until = None
        target_lead.scheduled_by = None
        target_lead.scheduled_at = None
        target_lead.last_attempted_at = call_time
        return

    if target_lead.status != waiting_status:
        return

    target_lead.claimed_by = None
    target_lead.claimed_until = None
    target_lead.scheduled_by = None
    target_lead.scheduled_at = None
    target_lead.last_attempted_at = call_time

    increment_step: int = 1
    target_lead.attempt_count += increment_step

    if target_lead.attempt_count >= MAX_LEAD_ATTEMPTS:
        target_lead.status = stopped_status
        target_lead.retry_locked_until = None
        return

    current_time: datetime = datetime.now(timezone.utc)
    lock_duration: timedelta = timedelta(hours=RETRY_LOCK_HOURS)
    target_lead.retry_locked_until = current_time + lock_duration
