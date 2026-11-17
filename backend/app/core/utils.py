from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from backend.app.config.base import TIMEZONE_NAME


@dataclass(frozen=True)
class IstDayWindows:
    today_start_utc: datetime
    tomorrow_start_utc: datetime
    yesterday_start_utc: datetime
    thirty_days_start_utc: datetime


@dataclass(frozen=True)
class IstDayWindow:
    day_date: date
    start_utc: datetime
    end_utc: datetime


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


def get_ist_today_start() -> datetime:
    current_ist: datetime = now_ist()
    today_start_ist: datetime = current_ist.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return today_start_ist


def build_ist_day_windows(day_count: int) -> list[IstDayWindow]:
    utc_zone: timezone = timezone.utc
    one_day: timedelta = timedelta(days=1)
    today_start_ist: datetime = get_ist_today_start()
    day_windows: list[IstDayWindow] = []
    for days_ago in range(day_count - 1, -1, -1):
        day_start_ist: datetime = today_start_ist - one_day * days_ago
        day_end_ist: datetime = day_start_ist + one_day
        day_windows.append(
            IstDayWindow(
                day_date=day_start_ist.date(),
                start_utc=day_start_ist.astimezone(utc_zone),
                end_utc=day_end_ist.astimezone(utc_zone),
            )
        )
    return day_windows


def calculate_ist_day_windows() -> IstDayWindows:
    utc_zone: timezone = timezone.utc
    one_day: timedelta = timedelta(days=1)
    twenty_nine_days: timedelta = timedelta(days=29)
    today_start_ist: datetime = get_ist_today_start()
    tomorrow_start_ist: datetime = today_start_ist + one_day
    yesterday_start_ist: datetime = today_start_ist - one_day
    thirty_days_start_ist: datetime = today_start_ist - twenty_nine_days
    time_windows: IstDayWindows = IstDayWindows(
        today_start_utc=today_start_ist.astimezone(utc_zone),
        tomorrow_start_utc=tomorrow_start_ist.astimezone(utc_zone),
        yesterday_start_utc=yesterday_start_ist.astimezone(utc_zone),
        thirty_days_start_utc=thirty_days_start_ist.astimezone(utc_zone),
    )
    return time_windows
