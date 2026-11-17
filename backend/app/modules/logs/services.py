import csv
import io
from typing import Any

from backend.app.core.errors import AppException
from backend.app.core.utils import (
    IstDayWindow,
    build_ist_day_windows,
    parse_utc_datetime,
    to_ist,
)
from backend.app.modules.calls import OUTGOING_DIRECTION, Call
from backend.app.modules.users import User


def ensure_manager_role(user: User) -> None:
    manager_role: str = "manager"
    forbidden_status: int = 403
    if user.role != manager_role:
        raise AppException("This dashboard is for managers.", forbidden_status)


def resolve_day_window(day: str) -> IstDayWindow:
    two_day_count: int = 2
    day_windows: list[IstDayWindow] = build_ist_day_windows(two_day_count)
    day_window_by_name: dict[str, IstDayWindow] = {
        "yesterday": day_windows[0],
        "today": day_windows[1],
    }
    day_window: IstDayWindow = day_window_by_name[day]
    return day_window


def fetch_day_call_records(day_window: IstDayWindow) -> list[Any]:
    call_records: list[Any] = (
        Call.query.join(User, Call.user_id == User.id)
        .filter(
            Call.dialed_at >= day_window.start_utc,
            Call.dialed_at < day_window.end_utc,
        )
        .with_entities(
            User.name,
            Call.phone_number,
            Call.dialed_at,
            Call.duration_seconds,
            Call.direction,
            Call.interested,
            Call.do_not_call,
            Call.notes,
        )
        .all()
    )
    return call_records


def sort_team_call_records(call_records: list[Any]) -> list[Any]:
    sorted_records: list[Any] = sorted(
        call_records,
        key=lambda record: (
            record[0].casefold(),
            parse_utc_datetime(record[2]),
        ),
    )
    return sorted_records


def format_yes_no(flag: bool) -> str:
    yes_label: str = "Yes"
    no_label: str = "No"
    if flag:
        return yes_label
    return no_label


def format_duration_minutes(duration_seconds: int) -> str:
    seconds_per_minute: int = 60
    decimal_places: int = 2
    duration_minutes: float = duration_seconds / seconds_per_minute
    formatted_duration: str = f"{duration_minutes:.{decimal_places}f}"
    return formatted_duration


def format_direction(direction: str) -> str:
    outgoing_label: str = "Outgoing"
    incoming_label: str = "Incoming"
    if direction == OUTGOING_DIRECTION:
        return outgoing_label
    return incoming_label


def build_call_log_row(call_record: Any) -> list[str]:
    (
        person_name,
        phone_number,
        raw_dialed_at,
        duration_seconds,
        direction,
        interested,
        do_not_call,
        notes,
    ) = call_record
    ist_dialed_at = to_ist(parse_utc_datetime(raw_dialed_at))
    call_row: list[str] = [
        person_name,
        phone_number,
        ist_dialed_at.strftime("%Y-%m-%d"),
        ist_dialed_at.strftime("%H:%M:%S"),
        format_direction(direction),
        format_yes_no(duration_seconds > 0),
        format_duration_minutes(duration_seconds),
        format_yes_no(interested),
        format_yes_no(do_not_call),
        notes or "",
    ]
    return call_row


def build_call_log_csv(call_rows: list[list[str]]) -> str:
    column_headers: list[str] = [
        "Salesperson",
        "Phone Number",
        "Date",
        "Time",
        "Direction",
        "Connected",
        "Duration (minutes)",
        "Interested",
        "Do Not Call",
        "Notes",
    ]
    csv_buffer = io.StringIO(newline="")
    csv_writer = csv.writer(csv_buffer)
    csv_writer.writerow(column_headers)
    csv_writer.writerows(call_rows)
    csv_text: str = csv_buffer.getvalue()
    return csv_text


def build_team_log_filename(day_window: IstDayWindow) -> str:
    day_date_label: str = day_window.day_date.isoformat()
    filename: str = f"call-logs-{day_date_label}.csv"
    return filename


def get_team_day_log_download(day: str) -> tuple[str, str]:
    day_window: IstDayWindow = resolve_day_window(day)
    call_records: list[Any] = fetch_day_call_records(day_window)
    sorted_records: list[Any] = sort_team_call_records(call_records)
    call_rows: list[list[str]] = [
        build_call_log_row(record) for record in sorted_records
    ]
    csv_text: str = build_call_log_csv(call_rows)
    filename: str = build_team_log_filename(day_window)
    download_result: tuple[str, str] = (csv_text, filename)
    return download_result
