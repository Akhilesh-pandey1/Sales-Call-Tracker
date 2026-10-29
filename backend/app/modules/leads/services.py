import csv
from datetime import datetime, timedelta, timezone
import io
import logging
from typing import Any
import phonenumbers
from sqlalchemy import update, Update
from backend.app.config.base import (
    CLAIM_MINUTES,
    MAX_LEAD_ATTEMPTS,
    MAX_LEAD_UPLOAD_MB,
    MAX_SCHEDULE_AHEAD_DAYS,
    RETRY_LOCK_HOURS,
    SCHEDULE_EXPIRE_HOURS,
)
from backend.app.core.errors import AppException
from backend.app.core.utils import now_ist, now_utc, parse_utc_datetime
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.leads.models import Lead
from backend.app.modules.leads.schemas import ScheduleLeadRequest

logger: logging.Logger = logging.getLogger(__name__)


def validate_and_format_e164(raw_phone: str, country_code: str) -> str | None:
    cleaned_phone: str = raw_phone.strip()
    if not cleaned_phone:
        return None

    try:
        parsed_number = phonenumbers.parse(cleaned_phone, country_code)
        if phonenumbers.is_valid_number(parsed_number):
            formatted_e164: str = phonenumbers.format_number(
                parsed_number, phonenumbers.PhoneNumberFormat.E164
            )
            return formatted_e164
    except phonenumbers.NumberParseException:
        return None

    return None


def get_ist_day_utc_range(days_back: int) -> tuple[datetime, datetime]:
    current_ist: datetime = now_ist()
    midnight_today_ist: datetime = current_ist.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    days_back_delta: timedelta = timedelta(days=days_back)
    midnight_of_day_ist: datetime = midnight_today_ist - days_back_delta
    one_day: timedelta = timedelta(days=1)
    midnight_of_next_day_ist: datetime = midnight_of_day_ist + one_day
    utc_zone: timezone = timezone.utc
    start_utc: datetime = midnight_of_day_ist.astimezone(utc_zone)
    end_utc: datetime = midnight_of_next_day_ist.astimezone(utc_zone)
    result_range: tuple[datetime, datetime] = (start_utc, end_utc)
    return result_range


def booking_belongs_to_another_user(target_lead: Lead, user_id: int) -> bool:
    booking_owner_id: int | None = target_lead.scheduled_by
    owner_is_someone_else: bool = (
        booking_owner_id is not None and booking_owner_id != user_id
    )
    return owner_is_someone_else


def find_or_create_lead_for_call(phone_number: str) -> Lead:
    waiting_status: str = "waiting"
    existing_lead: Lead | None = Lead.query.filter_by(
        phone_number=phone_number
    ).first()
    if existing_lead is not None:
        return existing_lead

    starting_attempt_count: int = 0
    new_lead: Lead = Lead(
        phone_number=phone_number,
        status=waiting_status,
        attempt_count=starting_attempt_count,
    )
    db.session.add(new_lead)
    return new_lead


def clear_lead_claims_and_schedule(target_lead: Lead) -> None:
    target_lead.claimed_by = None
    target_lead.claimed_until = None
    target_lead.scheduled_by = None
    target_lead.scheduled_at = None


def store_call_outcome_on_lead(
    target_lead: Lead,
    interested_choice: bool,
    do_not_call_choice: bool,
    notes_text: str,
) -> None:
    if interested_choice:
        target_lead.interested = True
    if do_not_call_choice:
        target_lead.do_not_call = True
    if notes_text:
        target_lead.notes = notes_text


def stop_lead_for_do_not_call(target_lead: Lead, call_time: datetime) -> None:
    stopped_status: str = "stopped"
    target_lead.status = stopped_status
    clear_lead_claims_and_schedule(target_lead)
    target_lead.retry_locked_until = None
    target_lead.last_attempted_at = call_time


def resolve_lead_for_call(
    phone_number: str,
    duration_seconds: int,
    call_time: datetime,
    caller_user_id: int,
    interested_choice: bool,
    do_not_call_choice: bool,
    notes_text: str,
) -> None:
    waiting_status: str = "waiting"
    done_status: str = "done"
    stopped_status: str = "stopped"
    connected_threshold: int = 0

    target_lead: Lead = find_or_create_lead_for_call(phone_number)

    store_call_outcome_on_lead(
        target_lead, interested_choice, do_not_call_choice, notes_text
    )

    if do_not_call_choice:
        stop_lead_for_do_not_call(target_lead, call_time)
        return

    if duration_seconds > connected_threshold:
        target_lead.status = done_status
        clear_lead_claims_and_schedule(target_lead)
        target_lead.last_attempted_at = call_time
        return

    if target_lead.status != waiting_status:
        return

    target_lead.claimed_by = None
    target_lead.claimed_until = None
    target_lead.last_attempted_at = call_time

    increment_step: int = 1
    target_lead.attempt_count += increment_step

    if target_lead.attempt_count >= MAX_LEAD_ATTEMPTS:
        target_lead.status = stopped_status
        target_lead.retry_locked_until = None
        clear_lead_claims_and_schedule(target_lead)
        return

    booking_is_clearable_by_caller: bool = not booking_belongs_to_another_user(
        target_lead, caller_user_id
    )
    if booking_is_clearable_by_caller:
        target_lead.scheduled_by = None
        target_lead.scheduled_at = None

    current_time: datetime = datetime.now(timezone.utc)
    lock_duration: timedelta = timedelta(hours=RETRY_LOCK_HOURS)
    target_lead.retry_locked_until = current_time + lock_duration


def collect_csv_row_values(row: list[str]) -> list[str]:
    row_values: list[str] = []
    for cell in row:
        for cell_value in cell.split(","):
            stripped_value: str = cell_value.strip()
            if stripped_value:
                row_values.append(stripped_value)
    return row_values


def resolve_csv_value_outcome(
    row_value: str,
    country_code: str,
    seen_in_batch: set[str],
) -> str:
    invalid_outcome: str = "invalid"
    duplicate_outcome: str = "duplicate"
    added_outcome: str = "added"

    normalized_number: str | None = validate_and_format_e164(
        row_value, country_code
    )
    if normalized_number is None:
        return invalid_outcome

    if normalized_number in seen_in_batch:
        return duplicate_outcome
    seen_in_batch.add(normalized_number)

    lead_exists: bool = (
        db.session.query(Lead.id).filter_by(phone_number=normalized_number).first()
        is not None
    )
    if lead_exists:
        return duplicate_outcome

    new_lead: Lead = Lead(phone_number=normalized_number, status="waiting")
    db.session.add(new_lead)
    return added_outcome


def import_leads_csv(file_content: bytes, country_code: str) -> dict[str, Any]:
    max_bytes_allowed: int = MAX_LEAD_UPLOAD_MB * 1024 * 1024
    bad_request_code: int = 400
    if len(file_content) > max_bytes_allowed:
        raise AppException("File is too large.", bad_request_code)

    try:
        decoded_content: str = file_content.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded_content = file_content.decode("latin-1", errors="replace")

    csv_stream: io.StringIO = io.StringIO(decoded_content)
    row_reader = csv.reader(csv_stream)

    added_count: int = 0
    duplicate_count: int = 0
    invalid_count: int = 0
    seen_in_batch: set[str] = set()
    invalid_outcome: str = "invalid"
    duplicate_outcome: str = "duplicate"

    for row in row_reader:
        for row_value in collect_csv_row_values(row):
            value_outcome: str = resolve_csv_value_outcome(
                row_value, country_code, seen_in_batch
            )
            if value_outcome == invalid_outcome:
                invalid_count += 1
            elif value_outcome == duplicate_outcome:
                duplicate_count += 1
            else:
                added_count += 1

    db.session.commit()

    import_result: dict[str, Any] = {
        "status": True,
        "added": added_count,
        "duplicates": duplicate_count,
        "invalid": invalid_count,
    }
    return import_result


def get_waiting_by_attempt_counts() -> dict[str, int]:
    waiting_status: str = "waiting"
    max_waiting_attempts: int = MAX_LEAD_ATTEMPTS - 1
    possible_attempt_counts: range = range(max_waiting_attempts + 1)
    attempt_split: dict[str, int] = {
        str(attempt_count): 0 for attempt_count in possible_attempt_counts
    }
    attempt_rows = (
        db.session.query(Lead.attempt_count, db.func.count(Lead.id))
        .filter(Lead.status == waiting_status, Lead.scheduled_at.is_(None))
        .group_by(Lead.attempt_count)
        .all()
    )

    for attempt_count, lead_count in attempt_rows:
        attempt_key: str = str(attempt_count)
        attempt_split[attempt_key] = lead_count

    return attempt_split


def get_pool_bucket_counts() -> dict[str, Any]:
    waiting_status: str = "waiting"
    done_status: str = "done"
    stopped_status: str = "stopped"

    waiting_by_attempts: dict[str, int] = get_waiting_by_attempt_counts()
    waiting_total: int = sum(waiting_by_attempts.values())
    scheduled_count: int = Lead.query.filter(
        Lead.status == waiting_status, Lead.scheduled_at.is_not(None)
    ).count()
    connected_count: int = Lead.query.filter_by(status=done_status).count()
    stopped_count: int = Lead.query.filter_by(status=stopped_status).count()

    counts: dict[str, Any] = {
        "waiting": waiting_total,
        "waiting_by_attempts": waiting_by_attempts,
        "scheduled": scheduled_count,
        "connected": connected_count,
        "stopped": stopped_count,
    }
    return counts


def get_daily_ist_utc_ranges() -> dict[str, tuple[datetime, datetime]]:
    today_days_back: int = 0
    yesterday_days_back: int = 1
    daily_ranges: dict[str, tuple[datetime, datetime]] = {
        "today": get_ist_day_utc_range(today_days_back),
        "yesterday": get_ist_day_utc_range(yesterday_days_back),
    }
    return daily_ranges


def get_uploaded_day_counts() -> dict[str, int]:
    daily_ranges: dict[str, tuple[datetime, datetime]] = get_daily_ist_utc_ranges()
    today_range: tuple[datetime, datetime] = daily_ranges["today"]
    yesterday_range: tuple[datetime, datetime] = daily_ranges["yesterday"]

    today_count: int = Lead.query.filter(
        Lead.created_at >= today_range[0], Lead.created_at < today_range[1]
    ).count()
    yesterday_count: int = Lead.query.filter(
        Lead.created_at >= yesterday_range[0], Lead.created_at < yesterday_range[1]
    ).count()

    day_counts: dict[str, int] = {"today": today_count, "yesterday": yesterday_count}
    return day_counts


def get_tackled_day_counts() -> dict[str, int]:
    daily_ranges: dict[str, tuple[datetime, datetime]] = get_daily_ist_utc_ranges()
    today_range: tuple[datetime, datetime] = daily_ranges["today"]
    yesterday_range: tuple[datetime, datetime] = daily_ranges["yesterday"]
    lead_numbers_subquery = db.session.query(Lead.phone_number).scalar_subquery()

    today_count: int = (
        db.session.query(db.func.count(db.distinct(Call.phone_number)))
        .filter(
            Call.dialed_at >= today_range[0],
            Call.dialed_at < today_range[1],
            Call.phone_number.in_(lead_numbers_subquery),
        )
        .scalar()
    )
    yesterday_count: int = (
        db.session.query(db.func.count(db.distinct(Call.phone_number)))
        .filter(
            Call.dialed_at >= yesterday_range[0],
            Call.dialed_at < yesterday_range[1],
            Call.phone_number.in_(lead_numbers_subquery),
        )
        .scalar()
    )

    day_counts: dict[str, int] = {"today": today_count, "yesterday": yesterday_count}
    return day_counts


def get_leads_summary() -> dict[str, Any]:
    pool_counts: dict[str, Any] = get_pool_bucket_counts()
    uploaded_counts: dict[str, int] = get_uploaded_day_counts()
    tackled_counts: dict[str, int] = get_tackled_day_counts()

    summary_result: dict[str, Any] = {
        "status": True,
        "pool": pool_counts,
        "uploaded": uploaded_counts,
        "tackled": tackled_counts,
    }
    return summary_result


def schedule_lead_callback(lead_id: int, user_id: int, scheduled_at_raw: str) -> None:
    bad_request_code: int = 400
    not_found_code: int = 404

    target_lead: Lead | None = db.session.get(Lead, lead_id)
    if target_lead is None:
        raise AppException("Lead not found.", not_found_code)

    try:
        scheduled_datetime: datetime = parse_utc_datetime(scheduled_at_raw)
    except Exception:
        raise AppException(
            "Scheduled time must be in the future within 30 days.", bad_request_code
        )

    current_utc: datetime = now_utc()
    max_ahead_delta: timedelta = timedelta(days=MAX_SCHEDULE_AHEAD_DAYS)
    latest_allowed_time: datetime = current_utc + max_ahead_delta

    if scheduled_datetime <= current_utc or scheduled_datetime > latest_allowed_time:
        raise AppException(
            "Scheduled time must be in the future within 30 days.", bad_request_code
        )

    waiting_status: str = "waiting"
    target_lead.status = waiting_status
    target_lead.scheduled_by = user_id
    target_lead.scheduled_at = scheduled_datetime
    target_lead.claimed_by = None
    target_lead.claimed_until = None
    target_lead.retry_locked_until = None
    db.session.flush()


def schedule_resolved_lead_for_call(
    phone_number: str, scheduled_by_user_id: int, scheduled_at_raw: str
) -> bool:
    resolved_lead: Lead | None = Lead.query.filter_by(phone_number=phone_number).first()
    if resolved_lead is None:
        logger.warning("Skipping schedule for unknown lead %s", phone_number)
        return False

    booking_held_by_another_user: bool = booking_belongs_to_another_user(
        resolved_lead, scheduled_by_user_id
    )
    if booking_held_by_another_user:
        logger.warning(
            "Refusing schedule for lead %s already booked by user %s",
            phone_number,
            resolved_lead.scheduled_by,
        )
        return True

    try:
        schedule_lead_callback(resolved_lead.id, scheduled_by_user_id, scheduled_at_raw)
    except AppException as schedule_error:
        logger.warning(
            "Skipping schedule for lead %s: %s",
            phone_number,
            schedule_error.message,
        )
    return False


def find_candidate_lead(user_id: int, current_utc: datetime) -> Lead | None:
    waiting_status: str = "waiting"

    unexpired_claim: Lead | None = Lead.query.filter(
        Lead.claimed_by == user_id,
        Lead.claimed_until > current_utc,
        Lead.status == waiting_status,
    ).first()
    if unexpired_claim is not None:
        return unexpired_claim

    due_scheduled: Lead | None = (
        Lead.query.filter(
            Lead.scheduled_by == user_id,
            Lead.scheduled_at <= current_utc,
            Lead.status == waiting_status,
        )
        .order_by(Lead.scheduled_at.asc())
        .first()
    )
    if due_scheduled is not None:
        return due_scheduled

    pool_lead: Lead | None = (
        Lead.query.filter(
            Lead.status == waiting_status,
            Lead.scheduled_at.is_(None),
            (Lead.claimed_until.is_(None) | (Lead.claimed_until <= current_utc)),
            (
                Lead.retry_locked_until.is_(None)
                | (Lead.retry_locked_until <= current_utc)
            ),
        )
        .order_by(Lead.created_at.desc())
        .first()
    )
    return pool_lead


def release_active_claim(user_id: int) -> None:
    current_utc: datetime = now_utc()
    release_claim_statement: Update = (
        update(Lead)
        .where(Lead.claimed_by == user_id, Lead.claimed_until > current_utc)
        .values(claimed_by=None, claimed_until=None)
    )
    db.session.execute(release_claim_statement)


def release_expired_bookings() -> None:
    waiting_status: str = "waiting"
    current_utc: datetime = now_utc()
    expire_delta: timedelta = timedelta(hours=SCHEDULE_EXPIRE_HOURS)
    expire_cutoff: datetime = current_utc - expire_delta
    release_booking_statement: Update = (
        update(Lead)
        .where(Lead.status == waiting_status, Lead.scheduled_at < expire_cutoff)
        .values(scheduled_by=None, scheduled_at=None)
        .execution_options(synchronize_session=False)
    )
    db.session.execute(release_booking_statement)


def serve_next_lead(
    user_id: int,
    continue_calling: bool,
    schedule_data: ScheduleLeadRequest | None = None,
) -> dict[str, Any]:
    if schedule_data is not None:
        schedule_lead_callback(
            schedule_data.lead_id, user_id, schedule_data.scheduled_at
        )

    if not continue_calling:
        release_active_claim(user_id)
        db.session.commit()
        stopped_result: dict[str, Any] = {"status": True, "lead": None}
        return stopped_result

    current_utc: datetime = now_utc()
    candidate_lead: Lead | None = find_candidate_lead(user_id, current_utc)

    if candidate_lead is None:
        db.session.commit()
        empty_result: dict[str, Any] = {"status": True, "lead": None}
        return empty_result

    claim_delta: timedelta = timedelta(minutes=CLAIM_MINUTES)
    is_scheduled_lead: bool = candidate_lead.scheduled_at is not None
    candidate_lead.claimed_by = user_id
    candidate_lead.claimed_until = current_utc + claim_delta
    db.session.commit()

    lead_payload: dict[str, Any] = {
        "id": candidate_lead.id,
        "phone_number": candidate_lead.phone_number,
        "attempt_count": candidate_lead.attempt_count,
        "is_scheduled": is_scheduled_lead,
        "notes": candidate_lead.notes,
    }
    served_result: dict[str, Any] = {"status": True, "lead": lead_payload}
    return served_result
