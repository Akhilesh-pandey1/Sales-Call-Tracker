from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any
from backend.app.core.errors import AppException
from backend.app.core.utils import now_ist, parse_utc_datetime, to_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.settings import OfficeHours, get_or_create_office_hours_window
from backend.app.modules.users import User


@dataclass(frozen=True)
class DashboardTimeWindows:
    today_start_utc: datetime
    tomorrow_start_utc: datetime
    yesterday_start_utc: datetime
    thirty_days_start_utc: datetime


@dataclass(frozen=True)
class TeamCallAggregates:
    team_today: dict[str, int]
    team_yesterday: dict[str, int]
    team_thirty_days: dict[str, int]
    seconds_today_by_user: dict[int, int]
    seconds_yesterday_by_user: dict[int, int]
    seconds_thirty_days_by_user: dict[int, int]
    dials_today_by_hour: dict[int, int]
    dials_yesterday_by_hour: dict[int, int]
    dials_thirty_days_by_hour: dict[int, int]


@dataclass(frozen=True)
class PeriodHourlyInputs:
    hourly_dials: dict[int, int]
    office_hours: list[int]
    period_day_count: int
    dials_hold_daily_averages: bool


def calculate_dashboard_time_windows() -> DashboardTimeWindows:
    current_ist: datetime = now_ist()
    midnight_today_ist: datetime = current_ist.replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    one_day: timedelta = timedelta(days=1)
    twenty_nine_days: timedelta = timedelta(days=29)

    midnight_tomorrow_ist: datetime = midnight_today_ist + one_day
    midnight_yesterday_ist: datetime = midnight_today_ist - one_day
    start_thirty_days_ist: datetime = midnight_today_ist - twenty_nine_days

    utc_zone: timezone = timezone.utc
    time_windows: DashboardTimeWindows = DashboardTimeWindows(
        today_start_utc=midnight_today_ist.astimezone(utc_zone),
        tomorrow_start_utc=midnight_tomorrow_ist.astimezone(utc_zone),
        yesterday_start_utc=midnight_yesterday_ist.astimezone(utc_zone),
        thirty_days_start_utc=start_thirty_days_ist.astimezone(utc_zone),
    )
    return time_windows


def calculate_connected_percentage(dials: int, connected: int) -> int | None:
    zero_dials: int = 0
    if dials == zero_dials:
        return None

    multiplier: float = 100.0
    percentage_ratio: float = (connected / dials) * multiplier
    calculated_percent: int = int(round(percentage_ratio))
    return calculated_percent


def calculate_talk_minutes(talk_seconds: int) -> int:
    seconds_per_minute: int = 60
    talk_minutes: int = int(round(talk_seconds / seconds_per_minute))
    return talk_minutes


def calculate_not_connected(dials: int, connected: int) -> int:
    not_connected_total: int = dials - connected
    return not_connected_total


def calculate_rounded_average(total_value: float, divisor: int) -> int:
    zero_divisor: int = 0
    if divisor == zero_divisor:
        return zero_divisor
    rounded_average: int = int(round(total_value / divisor))
    return rounded_average


def create_empty_period_metrics() -> dict[str, int]:
    metrics: dict[str, int] = {"dials": 0, "connected": 0, "seconds": 0}
    return metrics


def apply_call_to_metrics(
    target_dict: dict[str, int], duration_seconds: int
) -> None:
    target_dict["dials"] += 1
    target_dict["seconds"] += duration_seconds
    zero_duration: int = 0
    if duration_seconds > zero_duration:
        target_dict["connected"] += 1


def get_office_hour_range() -> list[int]:
    office_hours_window: OfficeHours = get_or_create_office_hours_window()
    minutes_per_hour: int = 60
    window_start_hour: int = office_hours_window.start_minute // minutes_per_hour
    window_end_hour: int = office_hours_window.end_minute // minutes_per_hour
    office_hour_range: list[int] = list(
        range(window_start_hour, window_end_hour + 1)
    )
    return office_hour_range


def create_empty_hourly_counts(office_hours: list[int]) -> dict[int, int]:
    empty_counts: dict[int, int] = {hour: 0 for hour in office_hours}
    return empty_counts


def apply_call_to_hourly_bucket(
    hourly_counts: dict[int, int],
    dialed_at_utc: datetime,
    office_hour_set: set[int],
) -> None:
    ist_dialed_at: datetime = to_ist(dialed_at_utc)
    call_hour: int = ist_dialed_at.hour
    if call_hour in office_hour_set:
        hourly_counts[call_hour] += 1


def add_user_talk_seconds(
    user_seconds_by_user: dict[int, int], user_id: int, duration_seconds: int
) -> None:
    current_seconds: int = user_seconds_by_user.get(user_id, 0)
    user_seconds_by_user[user_id] = current_seconds + duration_seconds


def fetch_team_call_records(windows: DashboardTimeWindows) -> list[Any]:
    salesperson_role: str = "salesperson"
    team_call_records: list[Any] = (
        Call.query.join(User, Call.user_id == User.id)
        .filter(
            User.role == salesperson_role,
            Call.dialed_at >= windows.thirty_days_start_utc,
            Call.dialed_at < windows.tomorrow_start_utc,
        )
        .with_entities(Call.user_id, Call.dialed_at, Call.duration_seconds)
        .all()
    )
    return team_call_records


def fetch_active_salespeople() -> list[Any]:
    salesperson_role: str = "salesperson"
    active_salespeople: list[Any] = (
        User.query.filter_by(role=salesperson_role, is_active=True)
        .with_entities(User.id, User.name)
        .all()
    )
    return active_salespeople


def create_empty_team_aggregates(office_hours: list[int]) -> TeamCallAggregates:
    aggregates: TeamCallAggregates = TeamCallAggregates(
        team_today=create_empty_period_metrics(),
        team_yesterday=create_empty_period_metrics(),
        team_thirty_days=create_empty_period_metrics(),
        seconds_today_by_user={},
        seconds_yesterday_by_user={},
        seconds_thirty_days_by_user={},
        dials_today_by_hour=create_empty_hourly_counts(office_hours),
        dials_yesterday_by_hour=create_empty_hourly_counts(office_hours),
        dials_thirty_days_by_hour=create_empty_hourly_counts(office_hours),
    )
    return aggregates


def accumulate_team_call_records(
    call_records: list[Any],
    windows: DashboardTimeWindows,
    office_hours: list[int],
) -> TeamCallAggregates:
    office_hour_set: set[int] = set(office_hours)
    aggregates: TeamCallAggregates = create_empty_team_aggregates(office_hours)

    for user_id, raw_dialed_at, duration_seconds in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)

        apply_call_to_metrics(aggregates.team_thirty_days, duration_seconds)
        add_user_talk_seconds(
            aggregates.seconds_thirty_days_by_user, user_id, duration_seconds
        )
        apply_call_to_hourly_bucket(
            aggregates.dials_thirty_days_by_hour, dialed_at, office_hour_set
        )

        if dialed_at >= windows.today_start_utc:
            apply_call_to_metrics(aggregates.team_today, duration_seconds)
            add_user_talk_seconds(
                aggregates.seconds_today_by_user, user_id, duration_seconds
            )
            apply_call_to_hourly_bucket(
                aggregates.dials_today_by_hour, dialed_at, office_hour_set
            )
        elif dialed_at >= windows.yesterday_start_utc:
            apply_call_to_metrics(aggregates.team_yesterday, duration_seconds)
            add_user_talk_seconds(
                aggregates.seconds_yesterday_by_user, user_id, duration_seconds
            )
            apply_call_to_hourly_bucket(
                aggregates.dials_yesterday_by_hour, dialed_at, office_hour_set
            )

    return aggregates


def build_avg_per_person_per_day(
    period_totals: dict[str, int], person_day_divisor: int
) -> dict[str, int]:
    seconds_per_minute: int = 60
    not_connected_total: int = calculate_not_connected(
        period_totals["dials"], period_totals["connected"]
    )
    exact_talk_minutes: float = period_totals["seconds"] / seconds_per_minute
    average_block: dict[str, int] = {
        "dials": calculate_rounded_average(
            period_totals["dials"], person_day_divisor
        ),
        "connected": calculate_rounded_average(
            period_totals["connected"], person_day_divisor
        ),
        "not_connected": calculate_rounded_average(
            not_connected_total, person_day_divisor
        ),
        "minutes": calculate_rounded_average(
            exact_talk_minutes, person_day_divisor
        ),
    }
    return average_block


def build_calls_by_hour_block(hourly_inputs: PeriodHourlyInputs) -> dict[str, Any]:
    dial_counts: list[int] = []
    for window_hour in hourly_inputs.office_hours:
        hour_total: int = hourly_inputs.hourly_dials[window_hour]
        if hourly_inputs.dials_hold_daily_averages:
            hour_total = calculate_rounded_average(
                hour_total, hourly_inputs.period_day_count
            )
        dial_counts.append(hour_total)

    in_window_call_total: int = sum(
        hourly_inputs.hourly_dials[window_hour]
        for window_hour in hourly_inputs.office_hours
    )

    best_hour: int | None = None
    if in_window_call_total > 0:
        highest_count: int = -1
        for window_hour in hourly_inputs.office_hours:
            if hourly_inputs.hourly_dials[window_hour] > highest_count:
                highest_count = hourly_inputs.hourly_dials[window_hour]
                best_hour = window_hour

    calls_by_hour_block: dict[str, Any] = {
        "hours": hourly_inputs.office_hours,
        "dials": dial_counts,
        "best_hour": best_hour,
    }
    return calls_by_hour_block


def calculate_vs_yesterday(
    today_totals: dict[str, int], yesterday_totals: dict[str, int]
) -> dict[str, int]:
    today_not_connected: int = calculate_not_connected(
        today_totals["dials"], today_totals["connected"]
    )
    yesterday_not_connected: int = calculate_not_connected(
        yesterday_totals["dials"], yesterday_totals["connected"]
    )
    delta_block: dict[str, int] = {
        "dials": today_totals["dials"] - yesterday_totals["dials"],
        "connected": today_totals["connected"] - yesterday_totals["connected"],
        "not_connected": today_not_connected - yesterday_not_connected,
        "minutes": calculate_talk_minutes(today_totals["seconds"])
        - calculate_talk_minutes(yesterday_totals["seconds"]),
    }
    return delta_block


def build_top_people_list(
    active_salespeople: list[Any], seconds_by_user: dict[int, int]
) -> list[dict[str, Any]]:
    top_people_limit: int = 5
    zero_talk_seconds: int = 0
    people_with_talk_time: list[dict[str, Any]] = []
    for person_id, person_name in active_salespeople:
        talk_seconds: int = seconds_by_user.get(person_id, zero_talk_seconds)
        if talk_seconds > zero_talk_seconds:
            person_entry: dict[str, Any] = {
                "id": person_id,
                "name": person_name,
                "seconds": talk_seconds,
                "minutes": calculate_talk_minutes(talk_seconds),
            }
            people_with_talk_time.append(person_entry)
    ranked_people: list[dict[str, Any]] = sorted(
        people_with_talk_time,
        key=lambda entry: (-entry["seconds"], entry["id"]),
    )
    return ranked_people[:top_people_limit]


def build_team_period_block(
    period_totals: dict[str, int],
    active_salesperson_count: int,
    hourly_inputs: PeriodHourlyInputs,
    period_top_people: list[dict[str, Any]],
    vs_yesterday: dict[str, int] | None,
) -> dict[str, Any]:
    not_connected_total: int = calculate_not_connected(
        period_totals["dials"], period_totals["connected"]
    )
    talk_minutes: int = calculate_talk_minutes(period_totals["seconds"])
    connected_percent: int | None = calculate_connected_percentage(
        period_totals["dials"], period_totals["connected"]
    )
    person_day_divisor: int = active_salesperson_count * hourly_inputs.period_day_count
    average_block: dict[str, int] = build_avg_per_person_per_day(
        period_totals, person_day_divisor
    )
    calls_by_hour_block: dict[str, Any] = build_calls_by_hour_block(hourly_inputs)
    period_block: dict[str, Any] = {
        "dials": period_totals["dials"],
        "connected": period_totals["connected"],
        "not_connected": not_connected_total,
        "seconds": period_totals["seconds"],
        "minutes": talk_minutes,
        "connected_percent": connected_percent,
        "avg_per_person_per_day": average_block,
        "vs_yesterday": vs_yesterday,
        "calls_by_hour": calls_by_hour_block,
        "top_people": period_top_people,
    }
    return period_block


def fetch_team_dashboard_aggregates(
    office_hours: list[int],
) -> tuple[TeamCallAggregates, list[Any], int]:
    windows: DashboardTimeWindows = calculate_dashboard_time_windows()
    call_records: list[Any] = fetch_team_call_records(windows)
    aggregates: TeamCallAggregates = accumulate_team_call_records(
        call_records, windows, office_hours
    )
    active_salespeople: list[Any] = fetch_active_salespeople()
    active_salesperson_count: int = len(active_salespeople)
    dashboard_aggregates: tuple[TeamCallAggregates, list[Any], int] = (
        aggregates,
        active_salespeople,
        active_salesperson_count,
    )
    return dashboard_aggregates


def build_team_period_blocks(
    aggregates: TeamCallAggregates,
    active_salespeople: list[Any],
    active_salesperson_count: int,
    office_hours: list[int],
) -> dict[str, dict[str, Any]]:
    single_day_count: int = 1
    thirty_day_count: int = 30

    vs_yesterday_delta: dict[str, int] = calculate_vs_yesterday(
        aggregates.team_today, aggregates.team_yesterday
    )
    today_top_people: list[dict[str, Any]] = build_top_people_list(active_salespeople, aggregates.seconds_today_by_user)
    yesterday_top_people: list[dict[str, Any]] = build_top_people_list(active_salespeople, aggregates.seconds_yesterday_by_user)
    thirty_day_top_people: list[dict[str, Any]] = build_top_people_list(active_salespeople, aggregates.seconds_thirty_days_by_user)

    today_hourly_inputs = PeriodHourlyInputs(
        hourly_dials=aggregates.dials_today_by_hour, office_hours=office_hours,
        period_day_count=single_day_count, dials_hold_daily_averages=False,
    )
    yesterday_hourly_inputs = PeriodHourlyInputs(
        hourly_dials=aggregates.dials_yesterday_by_hour, office_hours=office_hours,
        period_day_count=single_day_count, dials_hold_daily_averages=False,
    )
    thirty_day_hourly_inputs = PeriodHourlyInputs(
        hourly_dials=aggregates.dials_thirty_days_by_hour, office_hours=office_hours,
        period_day_count=thirty_day_count, dials_hold_daily_averages=True,
    )

    today_block: dict[str, Any] = build_team_period_block(
        aggregates.team_today, active_salesperson_count,
        today_hourly_inputs, today_top_people, vs_yesterday_delta,
    )
    yesterday_block: dict[str, Any] = build_team_period_block(
        aggregates.team_yesterday, active_salesperson_count,
        yesterday_hourly_inputs, yesterday_top_people, None,
    )
    thirty_days_block: dict[str, Any] = build_team_period_block(
        aggregates.team_thirty_days, active_salesperson_count,
        thirty_day_hourly_inputs, thirty_day_top_people, None,
    )

    period_blocks: dict[str, dict[str, Any]] = {
        "today": today_block,
        "yesterday": yesterday_block,
        "last_30_days": thirty_days_block,
    }
    return period_blocks


def get_team_dashboard_data() -> dict[str, Any]:
    office_hours: list[int] = get_office_hour_range()
    aggregates, active_salespeople, active_salesperson_count = (
        fetch_team_dashboard_aggregates(office_hours)
    )
    period_blocks: dict[str, dict[str, Any]] = build_team_period_blocks(
        aggregates, active_salespeople, active_salesperson_count, office_hours
    )
    return period_blocks


def build_top_numbers_list(
    phone_summary: dict[str, dict[str, int]]
) -> list[dict[str, Any]]:
    top_numbers_raw: list[dict[str, Any]] = [
        {
            "phone_number": phone,
            "seconds": item["seconds"],
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


def get_person_dashboard_data(user_id: int) -> dict[str, Any]:
    target_user: User | None = db.session.get(User, user_id)
    if target_user is None:
        not_found_code: int = 404
        raise AppException("User not found.", not_found_code)

    windows: DashboardTimeWindows = calculate_dashboard_time_windows()
    call_records: list[Any] = (
        Call.query.filter(
            Call.user_id == user_id,
            Call.dialed_at >= windows.thirty_days_start_utc,
            Call.dialed_at < windows.tomorrow_start_utc,
        )
        .with_entities(Call.phone_number, Call.dialed_at, Call.duration_seconds)
        .all()
    )

    stats_today: dict[str, Any] = create_empty_period_metrics()
    stats_yesterday: dict[str, Any] = create_empty_period_metrics()
    stats_thirty_days: dict[str, Any] = create_empty_period_metrics()
    phone_summary: dict[str, dict[str, int]] = {}
    active_ist_dates: set[date] = set()

    for phone_number, raw_dialed_at, duration_seconds in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)
        call_ist_date: date = to_ist(dialed_at).date()
        active_ist_dates.add(call_ist_date)
        apply_call_to_metrics(stats_thirty_days, duration_seconds)

        if phone_number not in phone_summary:
            phone_summary[phone_number] = {"seconds": 0, "calls": 0}
        phone_summary[phone_number]["seconds"] += duration_seconds
        phone_summary[phone_number]["calls"] += 1

        if dialed_at >= windows.today_start_utc:
            apply_call_to_metrics(stats_today, duration_seconds)
        elif dialed_at >= windows.yesterday_start_utc:
            apply_call_to_metrics(stats_yesterday, duration_seconds)

    stats_today["connected_percent"] = calculate_connected_percentage(
        stats_today["dials"], stats_today["connected"]
    )
    stats_yesterday["connected_percent"] = calculate_connected_percentage(
        stats_yesterday["dials"], stats_yesterday["connected"]
    )
    stats_thirty_days["active_days"] = len(active_ist_dates)
    stats_thirty_days["connected_percent"] = calculate_connected_percentage(
        stats_thirty_days["dials"], stats_thirty_days["connected"]
    )

    sorted_top_numbers: list[dict[str, Any]] = build_top_numbers_list(
        phone_summary
    )

    response_payload: dict[str, Any] = {
        "name": target_user.name,
        "today": stats_today,
        "yesterday": stats_yesterday,
        "last_30_days": stats_thirty_days,
        "top_numbers": sorted_top_numbers,
    }
    return response_payload
