import csv
from datetime import datetime, timedelta, timezone
import io
from typing import Any
import phonenumbers
from backend.app.config.base import (
    CLAIM_MINUTES,
    MAX_LEAD_ATTEMPTS,
    MAX_LEAD_UPLOAD_MB,
    MAX_SCHEDULE_AHEAD_DAYS,
    RETRY_LOCK_HOURS,
)
from backend.app.core.errors import AppException
from backend.app.core.utils import now_ist, now_utc, parse_utc_datetime
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.leads.models import Lead
from backend.app.modules.leads.schemas import ScheduleLeadRequest
from backend.app.modules.users import User


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

    for row in row_reader:
        if not row:
            continue

        if len(row) > 1 and any(cell.strip() for cell in row[1:]):
            raise AppException("Please select a valid CSV file.", bad_request_code)

        first_column_value: str = row[0].strip()
        if not first_column_value:
            continue

        normalized_number: str | None = validate_and_format_e164(
            first_column_value, country_code
        )
        if normalized_number is None:
            invalid_count += 1
            continue

        if normalized_number in seen_in_batch:
            duplicate_count += 1
            continue
        seen_in_batch.add(normalized_number)

        lead_exists: bool = (
            db.session.query(Lead.id).filter_by(phone_number=normalized_number).first()
            is not None
        )
        if lead_exists:
            duplicate_count += 1
            continue

        new_lead: Lead = Lead(phone_number=normalized_number, status="waiting")
        db.session.add(new_lead)
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


def get_salespeople_lead_activity() -> list[dict[str, Any]]:
    salesperson_role: str = "salesperson"
    active_salespeople = (
        User.query.with_entities(User.id, User.name)
        .filter_by(role=salesperson_role, is_active=True)
        .order_by(User.id.asc())
        .all()
    )

    today_days_back: int = 0
    today_range: tuple[datetime, datetime] = get_ist_day_utc_range(today_days_back)
    start_utc: datetime = today_range[0]
    end_utc: datetime = today_range[1]

    lead_numbers_subquery = db.session.query(Lead.phone_number).scalar_subquery()
    today_lead_calls = (
        Call.query.with_entities(Call.user_id, Call.duration_seconds)
        .filter(
            Call.dialed_at >= start_utc,
            Call.dialed_at < end_utc,
            Call.phone_number.in_(lead_numbers_subquery),
        )
        .all()
    )

    activity_list: list[dict[str, Any]] = []
    zero_duration: int = 0

    for person_id, person_name in active_salespeople:
        person_calls = [
            duration for uid, duration in today_lead_calls if uid == person_id
        ]
        attempted: int = len(person_calls)
        connected: int = sum(1 for duration in person_calls if duration > zero_duration)
        not_connected: int = attempted - connected

        person_data: dict[str, Any] = {
            "id": person_id,
            "name": person_name,
            "attempted": attempted,
            "connected": connected,
            "not_connected": not_connected,
        }
        activity_list.append(person_data)

    return activity_list


def get_leads_summary() -> dict[str, Any]:
    pool_counts: dict[str, Any] = get_pool_bucket_counts()
    uploaded_counts: dict[str, int] = get_uploaded_day_counts()
    tackled_counts: dict[str, int] = get_tackled_day_counts()
    salespeople_activity: list[dict[str, Any]] = get_salespeople_lead_activity()

    summary_result: dict[str, Any] = {
        "status": True,
        "pool": pool_counts,
        "uploaded": uploaded_counts,
        "tackled": tackled_counts,
        "people": salespeople_activity,
    }
    return summary_result


def schedule_lead_callback(lead_id: int, user_id: int, scheduled_at_raw: str) -> None:
    bad_request_code: int = 400
    not_found_code: int = 404

    target_lead: Lead | None = db.session.get(Lead, lead_id)
    if target_lead is None:
        raise AppException("Lead not found.", not_found_code)

    done_status: str = "done"
    stopped_status: str = "stopped"
    if target_lead.status in (done_status, stopped_status):
        raise AppException(
            "Cannot schedule a completed or stopped lead.", bad_request_code
        )

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

    target_lead.scheduled_by = user_id
    target_lead.scheduled_at = scheduled_datetime
    target_lead.claimed_by = None
    target_lead.claimed_until = None
    db.session.flush()


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


def serve_next_lead(
    user_id: int, schedule_data: ScheduleLeadRequest | None = None
) -> dict[str, Any]:
    if schedule_data is not None:
        schedule_lead_callback(
            schedule_data.lead_id, user_id, schedule_data.scheduled_at
        )

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
    }
    served_result: dict[str, Any] = {"status": True, "lead": lead_payload}
    return served_result
