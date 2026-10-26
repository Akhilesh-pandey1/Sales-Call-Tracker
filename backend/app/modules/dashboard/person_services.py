from dataclasses import dataclass
from datetime import date, datetime
from typing import Any
from backend.app.core.errors import AppException
from backend.app.core.utils import parse_utc_datetime, to_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call, OUTGOING_DIRECTION
from backend.app.modules.dashboard.services import (
    DashboardTimeWindows,
    OfficeHoursWindowInputs,
    PeriodHourlyInputs,
    apply_direction_call_to_hourly_bucket,
    apply_direction_call_to_metrics,
    build_calls_by_hour_block,
    build_office_hours_window_inputs,
    build_talk_totals_block,
    calculate_connected_percentage,
    calculate_dashboard_time_windows,
    calculate_decimal_average,
    calculate_not_connected,
    calculate_rounded_average,
    calculate_talk_minutes,
    create_empty_hourly_counts,
    create_empty_period_metrics,
)
from backend.app.modules.settings import (
    OfficeHours,
    get_office_hours_view_with_label,
    get_or_create_office_hours_window,
)
from backend.app.modules.users import User


@dataclass(frozen=True)
class PersonPeriodAggregates:
    call_metrics: dict[str, int]
    outgoing_by_hour: dict[int, int]
    incoming_by_hour: dict[int, int]


@dataclass(frozen=True)
class PersonCallAggregates:
    person_today: PersonPeriodAggregates
    person_yesterday: PersonPeriodAggregates
    person_thirty_days: PersonPeriodAggregates
    active_day_dates: set[date]
    phone_summary: dict[str, dict[str, int]]


def create_empty_person_period_aggregates(
    office_hours: list[int],
) -> PersonPeriodAggregates:
    period_aggregates: PersonPeriodAggregates = PersonPeriodAggregates(
        call_metrics=create_empty_period_metrics(),
        outgoing_by_hour=create_empty_hourly_counts(office_hours),
        incoming_by_hour=create_empty_hourly_counts(office_hours),
    )
    return period_aggregates


def create_empty_person_aggregates(office_hours: list[int]) -> PersonCallAggregates:
    aggregates: PersonCallAggregates = PersonCallAggregates(
        person_today=create_empty_person_period_aggregates(office_hours),
        person_yesterday=create_empty_person_period_aggregates(office_hours),
        person_thirty_days=create_empty_person_period_aggregates(office_hours),
        active_day_dates=set(),
        phone_summary={},
    )
    return aggregates


def build_top_numbers_list(
    phone_summary: dict[str, dict[str, int]]
) -> list[dict[str, Any]]:
    top_numbers_raw: list[dict[str, Any]] = [
        {
            "phone_number": phone,
            "seconds": item["seconds"],
            "minutes": calculate_talk_minutes(item["seconds"]),
            "calls": item["calls"],
        }
        for phone, item in phone_summary.items()
    ]
    top_five_limit: int = 5
    sorted_top_numbers: list[dict[str, Any]] = sorted(
        top_numbers_raw,
        key=lambda entry: entry["seconds"],
        reverse=True,
    )[:top_five_limit]
    return sorted_top_numbers


def fetch_person_call_records(
    user_id: int, windows: DashboardTimeWindows
) -> list[Any]:
    person_call_records: list[Any] = (
        Call.query.filter(
            Call.user_id == user_id,
            Call.dialed_at >= windows.thirty_days_start_utc,
            Call.dialed_at < windows.tomorrow_start_utc,
        )
        .with_entities(
            Call.phone_number, Call.dialed_at, Call.duration_seconds, Call.direction
        )
        .all()
    )
    return person_call_records


def add_phone_call_totals(
    phone_summary: dict[str, dict[str, int]],
    phone_number: str,
    duration_seconds: int,
) -> None:
    if phone_number not in phone_summary:
        phone_summary[phone_number] = {"seconds": 0, "calls": 0}
    phone_summary[phone_number]["seconds"] += duration_seconds
    phone_summary[phone_number]["calls"] += 1


def add_outgoing_date_to_active_days(
    active_day_dates: set[date], direction: str, dialed_at_utc: datetime
) -> None:
    if direction == OUTGOING_DIRECTION:
        active_day_dates.add(to_ist(dialed_at_utc).date())


def apply_person_call_to_period(
    period_aggregates: PersonPeriodAggregates,
    direction: str,
    duration_seconds: int,
    dialed_at_utc: datetime,
    window_inputs: OfficeHoursWindowInputs,
) -> None:
    apply_direction_call_to_metrics(
        period_aggregates.call_metrics, direction, duration_seconds
    )
    apply_direction_call_to_hourly_bucket(
        period_aggregates.outgoing_by_hour,
        period_aggregates.incoming_by_hour,
        direction,
        dialed_at_utc,
        window_inputs.window_start_minute,
        window_inputs.window_end_minute,
    )


def accumulate_person_call_records(
    call_records: list[Any],
    windows: DashboardTimeWindows,
    window_inputs: OfficeHoursWindowInputs,
) -> PersonCallAggregates:
    aggregates: PersonCallAggregates = create_empty_person_aggregates(
        window_inputs.office_hours
    )

    for phone_number, raw_dialed_at, duration_seconds, direction in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)
        add_outgoing_date_to_active_days(
            aggregates.active_day_dates, direction, dialed_at
        )
        add_phone_call_totals(
            aggregates.phone_summary, phone_number, duration_seconds
        )
        apply_person_call_to_period(
            aggregates.person_thirty_days,
            direction,
            duration_seconds,
            dialed_at,
            window_inputs,
        )

        if dialed_at >= windows.today_start_utc:
            apply_person_call_to_period(
                aggregates.person_today,
                direction,
                duration_seconds,
                dialed_at,
                window_inputs,
            )
        elif dialed_at >= windows.yesterday_start_utc:
            apply_person_call_to_period(
                aggregates.person_yesterday,
                direction,
                duration_seconds,
                dialed_at,
                window_inputs,
            )

    return aggregates


def build_person_period_hourly_inputs(
    period_aggregates: PersonPeriodAggregates,
    office_hours: list[int],
    period_day_count: int,
    counts_hold_daily_averages: bool,
) -> PeriodHourlyInputs:
    hourly_inputs: PeriodHourlyInputs = PeriodHourlyInputs(
        outgoing_by_hour=period_aggregates.outgoing_by_hour,
        incoming_by_hour=period_aggregates.incoming_by_hour,
        office_hours=office_hours,
        period_day_count=period_day_count,
        counts_hold_daily_averages=counts_hold_daily_averages,
    )
    return hourly_inputs


def build_person_period_block(
    period_totals: dict[str, int],
    hourly_inputs: PeriodHourlyInputs,
) -> dict[str, Any]:
    not_connected_total: int = calculate_not_connected(
        period_totals["dials"], period_totals["connected"]
    )
    talk_minutes: float = calculate_talk_minutes(period_totals["seconds"])
    connected_percent: int | None = calculate_connected_percentage(
        period_totals["dials"], period_totals["connected"]
    )
    calls_by_hour_block: dict[str, Any] = build_calls_by_hour_block(hourly_inputs)
    talk_totals_block: dict[str, Any] = build_talk_totals_block(period_totals)
    period_block: dict[str, Any] = {
        "dials": period_totals["dials"],
        "connected": period_totals["connected"],
        "not_connected": not_connected_total,
        "seconds": period_totals["seconds"],
        "minutes": talk_minutes,
        "connected_percent": connected_percent,
        "calls_by_hour": calls_by_hour_block,
        "talk_totals": talk_totals_block,
    }
    return period_block


def build_avg_per_active_day(
    thirty_day_totals: dict[str, int], active_day_count: int
) -> dict[str, float] | None:
    zero_active_days: int = 0
    seconds_per_minute: int = 60
    if active_day_count == zero_active_days:
        return None

    exact_talk_minutes: float = thirty_day_totals["seconds"] / seconds_per_minute
    average_block: dict[str, float] = {
        "dials": calculate_rounded_average(
            thirty_day_totals["dials"], active_day_count
        ),
        "connected": calculate_rounded_average(
            thirty_day_totals["connected"], active_day_count
        ),
        "minutes": calculate_decimal_average(
            exact_talk_minutes, active_day_count
        ),
    }
    return average_block


def build_person_period_blocks(
    aggregates: PersonCallAggregates, office_hours: list[int]
) -> dict[str, dict[str, Any]]:
    single_day_count: int = 1
    thirty_day_count: int = 30
    today_hourly_inputs: PeriodHourlyInputs = build_person_period_hourly_inputs(
        aggregates.person_today,
        office_hours,
        single_day_count,
        counts_hold_daily_averages=False,
    )
    yesterday_hourly_inputs: PeriodHourlyInputs = build_person_period_hourly_inputs(
        aggregates.person_yesterday,
        office_hours,
        single_day_count,
        counts_hold_daily_averages=False,
    )
    thirty_day_hourly_inputs: PeriodHourlyInputs = build_person_period_hourly_inputs(
        aggregates.person_thirty_days,
        office_hours,
        thirty_day_count,
        counts_hold_daily_averages=True,
    )

    today_block: dict[str, Any] = build_person_period_block(
        aggregates.person_today.call_metrics, today_hourly_inputs
    )
    yesterday_block: dict[str, Any] = build_person_period_block(
        aggregates.person_yesterday.call_metrics, yesterday_hourly_inputs
    )
    thirty_day_base_block: dict[str, Any] = build_person_period_block(
        aggregates.person_thirty_days.call_metrics, thirty_day_hourly_inputs
    )

    active_day_count: int = len(aggregates.active_day_dates)
    avg_per_active_day_block: dict[str, float] | None = build_avg_per_active_day(
        aggregates.person_thirty_days.call_metrics, active_day_count
    )
    thirty_days_block: dict[str, Any] = {
        **thirty_day_base_block,
        "active_days": active_day_count,
        "avg_per_active_day": avg_per_active_day_block,
    }
    period_blocks: dict[str, dict[str, Any]] = {
        "today": today_block,
        "yesterday": yesterday_block,
        "last_30_days": thirty_days_block,
    }
    return period_blocks


def get_person_dashboard_data(user_id: int) -> dict[str, Any]:
    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        not_found_code: int = 404
        raise AppException("User not found.", not_found_code)

    office_hours_window: OfficeHours = get_or_create_office_hours_window()
    window_inputs: OfficeHoursWindowInputs = build_office_hours_window_inputs(
        office_hours_window
    )
    windows: DashboardTimeWindows = calculate_dashboard_time_windows()
    call_records: list[Any] = fetch_person_call_records(user_id, windows)
    aggregates: PersonCallAggregates = accumulate_person_call_records(
        call_records, windows, window_inputs
    )
    period_blocks: dict[str, dict[str, Any]] = build_person_period_blocks(
        aggregates, window_inputs.office_hours
    )
    sorted_top_numbers: list[dict[str, Any]] = build_top_numbers_list(
        aggregates.phone_summary
    )
    office_hours_view_with_label: dict[str, Any] = get_office_hours_view_with_label(
        office_hours_window
    )
    response_payload: dict[str, Any] = {
        "name": target_user.name,
        "office_hours": office_hours_view_with_label["office_hours"],
        "office_hours_label": office_hours_view_with_label["office_hours_label"],
        "office_hours_full_label": office_hours_view_with_label[
            "office_hours_full_label"
        ],
        "today": period_blocks["today"],
        "yesterday": period_blocks["yesterday"],
        "last_30_days": period_blocks["last_30_days"],
        "top_numbers": sorted_top_numbers,
    }
    return response_payload
