from datetime import datetime, timedelta
import logging
from typing import Any
from backend.app.config.base import MAX_CALL_AGE_DAYS
from backend.app.core.utils import (
    normalize_phone_number,
    now_utc,
    parse_utc_datetime,
    to_ist,
)
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads import (
    resolve_lead_for_call,
    schedule_resolved_lead_for_call,
)
from backend.app.modules.settings import get_or_create_office_hours_window

logger: logging.Logger = logging.getLogger(__name__)

OUTGOING_DIRECTION: str = "outgoing"
INCOMING_DIRECTION: str = "incoming"


def get_ist_start_minute_of_day(dialed_at_utc: datetime) -> int:
    ist_start_time = to_ist(dialed_at_utc)
    minutes_per_hour = 60
    start_minute_of_day = ist_start_time.hour * minutes_per_hour + ist_start_time.minute
    return start_minute_of_day


def has_invalid_call_duration(raw_duration: Any) -> bool:
    zero_duration: int = 0
    if not isinstance(raw_duration, int) or isinstance(raw_duration, bool):
        return True

    duration_is_negative: bool = raw_duration < zero_duration
    return duration_is_negative


def extract_call_direction(item: dict[str, Any]) -> str | None:
    raw_direction: Any = item.get("direction")
    if raw_direction is None:
        return OUTGOING_DIRECTION
    if raw_direction in (OUTGOING_DIRECTION, INCOMING_DIRECTION):
        valid_direction: str = str(raw_direction)
        return valid_direction

    logger.warning("Discarding call item with invalid direction: %s", item)
    return None


def extract_valid_call(
    item: Any,
    default_country: str,
    cutoff_time: datetime,
    window_start_minute: int,
    window_end_minute: int,
    seen_call_ids: set[str],
) -> tuple[str, str, datetime, int, str | None, str] | None:
    if not isinstance(item, dict):
        logger.warning("Discarding non-dict call item: %s", item)
        return None

    raw_call_id: Any = item.get("call_id")
    if not isinstance(raw_call_id, str) or not raw_call_id.strip():
        logger.warning("Discarding call item with invalid call_id: %s", item)
        return None
    call_id: str = raw_call_id.strip()

    if call_id in seen_call_ids or db.session.get(Call, call_id) is not None:
        logger.info("Skipping duplicate call_id: %s", call_id)
        return None

    raw_phone: Any = item.get("phone_number")
    if not isinstance(raw_phone, str) or not raw_phone.strip():
        logger.warning("Discarding call item with invalid phone_number: %s", item)
        return None
    clean_phone: str = raw_phone.strip()

    raw_dialed_at: Any = item.get("dialed_at")
    try:
        dialed_at_utc: datetime = parse_utc_datetime(raw_dialed_at)
    except (ValueError, TypeError):
        logger.warning("Discarding call item with unparseable dialed_at: %s", item)
        return None

    if dialed_at_utc < cutoff_time:
        logger.info("Discarding call %s older than cutoff", call_id)
        return None

    ist_start_minute_of_day = get_ist_start_minute_of_day(dialed_at_utc)
    outside_window = (
        ist_start_minute_of_day < window_start_minute
        or ist_start_minute_of_day > window_end_minute
    )
    if outside_window:
        logger.warning("Discarding call %s outside office hours window", call_id)
        return None

    raw_duration: Any = item.get("duration_seconds")
    if has_invalid_call_duration(raw_duration):
        logger.warning("Discarding call item with invalid duration: %s", item)
        return None

    call_direction: str | None = extract_call_direction(item)
    if call_direction is None:
        return None

    normalized_phone: str = normalize_phone_number(clean_phone, default_country)

    raw_scheduled_at: Any = item.get("scheduled_at")
    scheduled_at_raw: str | None = None
    if raw_scheduled_at is not None:
        scheduled_at_raw = str(raw_scheduled_at)

    parsed_record: tuple[str, str, datetime, int, str | None, str] = (
        call_id,
        normalized_phone,
        dialed_at_utc,
        raw_duration,
        scheduled_at_raw,
        call_direction,
    )
    return parsed_record


def sync_calls_batch(
    raw_calls: list[dict[str, Any]], user_id: int, user_country: str
) -> dict[str, bool]:
    seen_call_ids: set[str] = set()
    current_time: datetime = now_utc()
    age_limit_days: int = MAX_CALL_AGE_DAYS
    cutoff_time: datetime = current_time - timedelta(days=age_limit_days)
    office_hours_window = get_or_create_office_hours_window()
    window_start_minute = office_hours_window.start_minute
    window_end_minute = office_hours_window.end_minute

    for item in raw_calls:
        call_data = extract_valid_call(
            item,
            user_country,
            cutoff_time,
            window_start_minute,
            window_end_minute,
            seen_call_ids,
        )
        if call_data is None:
            continue

        call_id, phone_number, dialed_at, duration, scheduled_at_raw, direction = (
            call_data
        )
        call_record: Call = Call(
            call_id=call_id,
            user_id=user_id,
            phone_number=phone_number,
            dialed_at=dialed_at,
            duration_seconds=duration,
            direction=direction,
        )
        db.session.add(call_record)
        seen_call_ids.add(call_id)

        if direction == OUTGOING_DIRECTION:
            resolve_lead_for_call(phone_number, duration, dialed_at)

            if scheduled_at_raw is not None:
                schedule_resolved_lead_for_call(phone_number, user_id, scheduled_at_raw)

    db.session.commit()

    response_data: dict[str, bool] = {"status": True}
    return response_data
