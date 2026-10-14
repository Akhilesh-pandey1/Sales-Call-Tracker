from datetime import datetime, timezone
import re
from zoneinfo import ZoneInfo
import phonenumbers
from backend.app.config.base import TIMEZONE_NAME


def get_ist_timezone() -> ZoneInfo:
    timezone_identifier: str = TIMEZONE_NAME
    result_timezone: ZoneInfo = ZoneInfo(timezone_identifier)
    return result_timezone


def now_ist() -> datetime:
    current_timezone: ZoneInfo = get_ist_timezone()
    current_time: datetime = datetime.now(current_timezone)
    return current_time


def now_utc() -> datetime:
    utc_zone: timezone = timezone.utc
    current_time: datetime = datetime.now(utc_zone)
    return current_time


def to_ist(date_time_value: datetime) -> datetime:
    utc_zone: timezone = timezone.utc
    current_timezone: ZoneInfo = get_ist_timezone()
    working_value: datetime = date_time_value
    if working_value.tzinfo is None:
        working_value = working_value.replace(tzinfo=utc_zone)
    converted_time: datetime = working_value.astimezone(current_timezone)
    return converted_time


def normalize_phone_number(raw_number: str, default_country: str = "IN") -> str:
    cleaned_number: str = raw_number.strip()
    try:
        parsed_number = phonenumbers.parse(cleaned_number, default_country)
        if phonenumbers.is_valid_number(parsed_number):
            formatted_number: str = phonenumbers.format_number(
                parsed_number, phonenumbers.PhoneNumberFormat.E164
            )
            return formatted_number
    except phonenumbers.NumberParseException:
        pass

    non_digit_pattern: str = r"\D"
    replacement_character: str = ""
    digits_only: str = re.sub(non_digit_pattern, replacement_character, cleaned_number)
    if digits_only:
        result_digits: str = digits_only
        return result_digits

    fallback_number: str = cleaned_number
    return fallback_number


def parse_utc_datetime(datetime_value: str | datetime) -> datetime:
    utc_zone: timezone = timezone.utc
    if isinstance(datetime_value, datetime):
        if datetime_value.tzinfo is None:
            utc_datetime: datetime = datetime_value.replace(tzinfo=utc_zone)
            return utc_datetime
        converted_datetime: datetime = datetime_value.astimezone(utc_zone)
        return converted_datetime

    cleaned_string: str = str(datetime_value).strip().replace("Z", "+00:00")
    parsed_datetime: datetime = datetime.fromisoformat(cleaned_string)
    if parsed_datetime.tzinfo is None:
        utc_datetime = parsed_datetime.replace(tzinfo=utc_zone)
        return utc_datetime

    converted_datetime = parsed_datetime.astimezone(utc_zone)
    return converted_datetime
