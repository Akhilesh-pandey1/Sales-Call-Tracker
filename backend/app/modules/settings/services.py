from backend.app.core.errors import AppException
from backend.app.extensions import db
from backend.app.modules.settings.models import DEFAULT_WINDOW_ID, OfficeHours

MINUTES_PER_HOUR: int = 60


def format_minute_of_day(minute_of_day: int) -> str:
    hour_of_day: int = minute_of_day // MINUTES_PER_HOUR
    minute_within_hour: int = minute_of_day % MINUTES_PER_HOUR
    return f"{hour_of_day:02d}:{minute_within_hour:02d}"


def parse_time_to_minute(time_text: str) -> int:
    hour_text, minute_text = time_text.split(":")
    hour_value: int = int(hour_text)
    minute_value: int = int(minute_text)
    return hour_value * MINUTES_PER_HOUR + minute_value


def get_or_create_office_hours_window() -> OfficeHours:
    existing_window: OfficeHours | None = db.session.get(
        OfficeHours, DEFAULT_WINDOW_ID
    )
    if existing_window is not None:
        return existing_window

    default_window: OfficeHours = OfficeHours()
    db.session.add(default_window)
    db.session.commit()
    return default_window


def get_office_hours_view() -> dict[str, str]:
    office_hours_window: OfficeHours = get_or_create_office_hours_window()
    start_time: str = format_minute_of_day(office_hours_window.start_minute)
    end_time: str = format_minute_of_day(office_hours_window.end_minute)
    window_view: dict[str, str] = {"start_time": start_time, "end_time": end_time}
    return window_view


def update_office_hours_window(start_time: str, end_time: str) -> None:
    start_minute: int = parse_time_to_minute(start_time)
    end_minute: int = parse_time_to_minute(end_time)
    if end_minute <= start_minute:
        raise AppException("End time must be after start time.")

    office_hours_window: OfficeHours = get_or_create_office_hours_window()
    office_hours_window.start_minute = start_minute
    office_hours_window.end_minute = end_minute
    db.session.commit()
