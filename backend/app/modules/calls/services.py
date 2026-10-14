from datetime import datetime, timedelta
import logging
from typing import Any
from backend.app.config.base import MAX_CALL_AGE_DAYS
from backend.app.core.utils import (
    normalize_phone_number,
    now_utc,
    parse_utc_datetime,
)
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads import resolve_lead_for_call

logger: logging.Logger = logging.getLogger(__name__)


def extract_valid_call(
    item: Any,
    default_country: str,
    cutoff_time: datetime,
    seen_call_ids: set[str],
) -> tuple[str, str, datetime, int] | None:
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

    raw_duration: Any = item.get("duration_seconds")
    zero_duration: int = 0
    if not isinstance(raw_duration, int) or isinstance(raw_duration, bool):
        logger.warning("Discarding call item with non-integer duration: %s", item)
        return None
    if raw_duration < zero_duration:
        logger.warning("Discarding call item with negative duration: %s", item)
        return None

    normalized_phone: str = normalize_phone_number(clean_phone, default_country)
    parsed_record: tuple[str, str, datetime, int] = (
        call_id,
        normalized_phone,
        dialed_at_utc,
        raw_duration,
    )
    return parsed_record


def sync_calls_batch(
    raw_calls: list[dict[str, Any]], user_id: int, user_country: str
) -> dict[str, bool]:
    seen_call_ids: set[str] = set()
    current_time: datetime = now_utc()
    age_limit_days: int = MAX_CALL_AGE_DAYS
    cutoff_time: datetime = current_time - timedelta(days=age_limit_days)

    for item in raw_calls:
        call_data = extract_valid_call(
            item, user_country, cutoff_time, seen_call_ids
        )
        if call_data is None:
            continue

        call_id, phone_number, dialed_at, duration = call_data
        call_record: Call = Call(
            call_id=call_id,
            user_id=user_id,
            phone_number=phone_number,
            dialed_at=dialed_at,
            duration_seconds=duration,
        )
        db.session.add(call_record)
        seen_call_ids.add(call_id)

        resolve_lead_for_call(phone_number, duration, dialed_at)

    db.session.commit()

    response_data: dict[str, bool] = {"status": True}
    return response_data
