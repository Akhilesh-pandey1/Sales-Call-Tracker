from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from backend.app.core.utils import now_ist, parse_utc_datetime, to_ist
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
class TeamPeriodAggregates:
    call_metrics: dict[str, int]
    talk_seconds_by_user: dict[int, int]
    outgoing_by_hour: dict[int, int]
    incoming_by_hour: dict[int, int]


@dataclass(frozen=True)
class TeamCallAggregates:
    team_today: TeamPeriodAggregates
    team_yesterday: TeamPeriodAggregates
    team_thirty_days: TeamPeriodAggregates


@dataclass(frozen=True)
class PeriodHourlyInputs:
    outgoing_by_hour: dict[int, int]
    incoming_by_hour: dict[int, int]
    office_hours: list[int]
    period_day_count: int
    counts_hold_daily_averages: bool


@dataclass(frozen=True)
class PeopleCallMetrics:
    today: dict[str, int]
    yesterday: dict[str, int]


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


def calculate_talk_minutes(talk_seconds: int) -> float:
    seconds_per_minute: int = 60
    decimal_places: int = 2
    talk_minutes: float = round(talk_seconds / seconds_per_minute, decimal_places)
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


def calculate_decimal_average(total_value: float, divisor: int) -> float:
    zero_divisor: int = 0
    decimal_places: int = 2
    zero_average: float = 0.0
    if divisor == zero_divisor:
        return zero_average
    decimal_average: float = round(total_value / divisor, decimal_places)
    return decimal_average


def create_empty_period_metrics() -> dict[str, int]:
    metrics: dict[str, int] = {
        "dials": 0,
        "connected": 0,
        "seconds": 0,
        "incoming_calls": 0,
        "incoming_seconds": 0,
    }
    return metrics


def apply_direction_call_to_metrics(
    period_metrics: dict[str, int], direction: str, duration_seconds: int
) -> None:
    outgoing_direction: str = "outgoing"
    zero_duration: int = 0
    period_metrics["seconds"] += duration_seconds
    if direction != outgoing_direction:
        period_metrics["incoming_calls"] += 1
        period_metrics["incoming_seconds"] += duration_seconds
        return
    period_metrics["dials"] += 1
    if duration_seconds > zero_duration:
        period_metrics["connected"] += 1


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


def apply_direction_call_to_hourly_bucket(
    outgoing_counts_by_hour: dict[int, int],
    incoming_counts_by_hour: dict[int, int],
    direction: str,
    dialed_at_utc: datetime,
    office_hour_set: set[int],
) -> None:
    outgoing_direction: str = "outgoing"
    ist_dialed_at: datetime = to_ist(dialed_at_utc)
    call_hour: int = ist_dialed_at.hour
    if call_hour not in office_hour_set:
        return
    if direction == outgoing_direction:
        outgoing_counts_by_hour[call_hour] += 1
        return
    incoming_counts_by_hour[call_hour] += 1


def add_user_talk_seconds(
    user_seconds_by_user: dict[int, int], user_id: int, duration_seconds: int
) -> None:
    current_seconds: int = user_seconds_by_user.get(user_id, 0)
    user_seconds_by_user[user_id] = current_seconds + duration_seconds


def fetch_team_call_records(
    windows: DashboardTimeWindows, window_start_utc: datetime
) -> list[Any]:
    salesperson_role: str = "salesperson"
    team_call_records: list[Any] = (
        Call.query.join(User, Call.user_id == User.id)
        .filter(
            User.role == salesperson_role,
            Call.dialed_at >= window_start_utc,
            Call.dialed_at < windows.tomorrow_start_utc,
        )
        .with_entities(Call.user_id, Call.dialed_at, Call.duration_seconds, Call.direction)
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


def create_empty_team_period_aggregates(
    office_hours: list[int],
) -> TeamPeriodAggregates:
    period_aggregates: TeamPeriodAggregates = TeamPeriodAggregates(
        call_metrics=create_empty_period_metrics(),
        talk_seconds_by_user={},
        outgoing_by_hour=create_empty_hourly_counts(office_hours),
        incoming_by_hour=create_empty_hourly_counts(office_hours),
    )
    return period_aggregates


def create_empty_team_aggregates(office_hours: list[int]) -> TeamCallAggregates:
    aggregates: TeamCallAggregates = TeamCallAggregates(
        team_today=create_empty_team_period_aggregates(office_hours),
        team_yesterday=create_empty_team_period_aggregates(office_hours),
        team_thirty_days=create_empty_team_period_aggregates(office_hours),
    )
    return aggregates


def apply_team_call_to_period_aggregates(
    period_aggregates: TeamPeriodAggregates,
    user_id: int,
    direction: str,
    duration_seconds: int,
    dialed_at: datetime,
    office_hour_set: set[int],
) -> None:
    apply_direction_call_to_metrics(
        period_aggregates.call_metrics, direction, duration_seconds
    )
    add_user_talk_seconds(
        period_aggregates.talk_seconds_by_user, user_id, duration_seconds
    )
    apply_direction_call_to_hourly_bucket(
        period_aggregates.outgoing_by_hour,
        period_aggregates.incoming_by_hour,
        direction,
        dialed_at,
        office_hour_set,
    )


def accumulate_team_call_records(
    call_records: list[Any],
    windows: DashboardTimeWindows,
    office_hours: list[int],
) -> TeamCallAggregates:
    office_hour_set: set[int] = set(office_hours)
    aggregates: TeamCallAggregates = create_empty_team_aggregates(office_hours)

    for user_id, raw_dialed_at, duration_seconds, direction in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)

        apply_team_call_to_period_aggregates(
            aggregates.team_thirty_days,
            user_id,
            direction,
            duration_seconds,
            dialed_at,
            office_hour_set,
        )

        if dialed_at >= windows.today_start_utc:
            apply_team_call_to_period_aggregates(
                aggregates.team_today,
                user_id,
                direction,
                duration_seconds,
                dialed_at,
                office_hour_set,
            )
        elif dialed_at >= windows.yesterday_start_utc:
            apply_team_call_to_period_aggregates(
                aggregates.team_yesterday,
                user_id,
                direction,
                duration_seconds,
                dialed_at,
                office_hour_set,
            )

    return aggregates


def build_avg_per_person_per_day(
    period_totals: dict[str, int], person_day_divisor: int
) -> dict[str, float]:
    seconds_per_minute: int = 60
    not_connected_total: int = calculate_not_connected(
        period_totals["dials"], period_totals["connected"]
    )
    exact_talk_minutes: float = period_totals["seconds"] / seconds_per_minute
    average_block: dict[str, float] = {
        "dials": calculate_rounded_average(
            period_totals["dials"], person_day_divisor
        ),
        "connected": calculate_rounded_average(
            period_totals["connected"], person_day_divisor
        ),
        "not_connected": calculate_rounded_average(
            not_connected_total, person_day_divisor
        ),
        "minutes": calculate_decimal_average(
            exact_talk_minutes, person_day_divisor
        ),
    }
    return average_block


def build_calls_by_hour_block(
    hourly_inputs: PeriodHourlyInputs,
) -> dict[str, Any]:
    outgoing_counts: list[int] = []
    incoming_counts: list[int] = []
    for window_hour in hourly_inputs.office_hours:
        outgoing_hour_total: int = hourly_inputs.outgoing_by_hour[window_hour]
        incoming_hour_total: int = hourly_inputs.incoming_by_hour[window_hour]
        if hourly_inputs.counts_hold_daily_averages:
            outgoing_hour_total = calculate_rounded_average(
                outgoing_hour_total, hourly_inputs.period_day_count
            )
            incoming_hour_total = calculate_rounded_average(
                incoming_hour_total, hourly_inputs.period_day_count
            )
        outgoing_counts.append(outgoing_hour_total)
        incoming_counts.append(incoming_hour_total)

    in_window_call_total: int = sum(
        hourly_inputs.outgoing_by_hour[window_hour]
        + hourly_inputs.incoming_by_hour[window_hour]
        for window_hour in hourly_inputs.office_hours
    )

    best_hour: int | None = None
    if in_window_call_total > 0:
        highest_total: int = -1
        for window_hour in hourly_inputs.office_hours:
            hour_total: int = (
                hourly_inputs.outgoing_by_hour[window_hour]
                + hourly_inputs.incoming_by_hour[window_hour]
            )
            if hour_total > highest_total:
                highest_total = hour_total
                best_hour = window_hour

    calls_by_hour_block: dict[str, Any] = {
        "hours": hourly_inputs.office_hours,
        "outgoing": outgoing_counts,
        "incoming": incoming_counts,
        "best_hour": best_hour,
    }
    return calls_by_hour_block


def calculate_vs_yesterday(
    today_totals: dict[str, int], yesterday_totals: dict[str, int]
) -> dict[str, float]:
    decimal_places: int = 2
    today_not_connected: int = calculate_not_connected(
        today_totals["dials"], today_totals["connected"]
    )
    yesterday_not_connected: int = calculate_not_connected(
        yesterday_totals["dials"], yesterday_totals["connected"]
    )
    today_talk_minutes: float = calculate_talk_minutes(today_totals["seconds"])
    yesterday_talk_minutes: float = calculate_talk_minutes(yesterday_totals["seconds"])
    minutes_delta: float = round(
        today_talk_minutes - yesterday_talk_minutes, decimal_places
    )
    delta_block: dict[str, float] = {
        "dials": today_totals["dials"] - yesterday_totals["dials"],
        "connected": today_totals["connected"] - yesterday_totals["connected"],
        "not_connected": today_not_connected - yesterday_not_connected,
        "minutes": minutes_delta,
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


def calculate_talk_percent(part_seconds: int, total_seconds: int) -> int:
    zero_seconds: int = 0
    percent_multiplier: float = 100.0
    if total_seconds <= zero_seconds:
        return zero_seconds
    talk_percent: int = int(round((part_seconds / total_seconds) * percent_multiplier))
    return talk_percent


def build_talk_totals_block(period_metrics: dict[str, int]) -> dict[str, Any]:
    total_talk_seconds: int = period_metrics["seconds"]
    incoming_talk_seconds: int = period_metrics["incoming_seconds"]
    outgoing_talk_seconds: int = total_talk_seconds - incoming_talk_seconds
    talk_totals_block: dict[str, Any] = {
        "outgoing_calls": period_metrics["dials"],
        "outgoing_minutes": calculate_talk_minutes(outgoing_talk_seconds),
        "incoming_calls": period_metrics["incoming_calls"],
        "incoming_minutes": calculate_talk_minutes(incoming_talk_seconds),
        "outgoing_percent": calculate_talk_percent(
            outgoing_talk_seconds, total_talk_seconds
        ),
        "incoming_percent": calculate_talk_percent(
            incoming_talk_seconds, total_talk_seconds
        ),
    }
    return talk_totals_block


def build_team_period_block(
    period_totals: dict[str, int],
    active_salesperson_count: int,
    hourly_inputs: PeriodHourlyInputs,
    period_top_people: list[dict[str, Any]],
    vs_yesterday: dict[str, float] | None,
) -> dict[str, Any]:
    not_connected_total: int = calculate_not_connected(
        period_totals["dials"], period_totals["connected"]
    )
    talk_minutes: float = calculate_talk_minutes(period_totals["seconds"])
    connected_percent: int | None = calculate_connected_percentage(
        period_totals["dials"], period_totals["connected"]
    )
    person_day_divisor: int = active_salesperson_count * hourly_inputs.period_day_count
    average_block: dict[str, int] = build_avg_per_person_per_day(
        period_totals, person_day_divisor
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
        "avg_per_person_per_day": average_block,
        "vs_yesterday": vs_yesterday,
        "calls_by_hour": calls_by_hour_block,
        "talk_totals": talk_totals_block,
        "top_people": period_top_people,
    }
    return period_block


def fetch_team_dashboard_aggregates(
    office_hours: list[int],
) -> tuple[TeamCallAggregates, list[Any], int]:
    windows: DashboardTimeWindows = calculate_dashboard_time_windows()
    call_records: list[Any] = fetch_team_call_records(
        windows, windows.thirty_days_start_utc
    )
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

    vs_yesterday_delta: dict[str, float] = calculate_vs_yesterday(
        aggregates.team_today.call_metrics, aggregates.team_yesterday.call_metrics
    )
    today_top_people: list[dict[str, Any]] = build_top_people_list(
        active_salespeople, aggregates.team_today.talk_seconds_by_user
    )
    yesterday_top_people: list[dict[str, Any]] = build_top_people_list(
        active_salespeople, aggregates.team_yesterday.talk_seconds_by_user
    )
    thirty_day_top_people: list[dict[str, Any]] = build_top_people_list(
        active_salespeople, aggregates.team_thirty_days.talk_seconds_by_user
    )

    today_hourly_inputs: PeriodHourlyInputs = PeriodHourlyInputs(
        outgoing_by_hour=aggregates.team_today.outgoing_by_hour,
        incoming_by_hour=aggregates.team_today.incoming_by_hour,
        office_hours=office_hours,
        period_day_count=single_day_count,
        counts_hold_daily_averages=False,
    )
    yesterday_hourly_inputs: PeriodHourlyInputs = PeriodHourlyInputs(
        outgoing_by_hour=aggregates.team_yesterday.outgoing_by_hour,
        incoming_by_hour=aggregates.team_yesterday.incoming_by_hour,
        office_hours=office_hours,
        period_day_count=single_day_count,
        counts_hold_daily_averages=False,
    )
    thirty_day_hourly_inputs: PeriodHourlyInputs = PeriodHourlyInputs(
        outgoing_by_hour=aggregates.team_thirty_days.outgoing_by_hour,
        incoming_by_hour=aggregates.team_thirty_days.incoming_by_hour,
        office_hours=office_hours,
        period_day_count=thirty_day_count,
        counts_hold_daily_averages=True,
    )

    today_block: dict[str, Any] = build_team_period_block(
        aggregates.team_today.call_metrics,
        active_salesperson_count,
        today_hourly_inputs,
        today_top_people,
        vs_yesterday_delta,
    )
    yesterday_block: dict[str, Any] = build_team_period_block(
        aggregates.team_yesterday.call_metrics,
        active_salesperson_count,
        yesterday_hourly_inputs,
        yesterday_top_people,
        None,
    )
    thirty_days_block: dict[str, Any] = build_team_period_block(
        aggregates.team_thirty_days.call_metrics,
        active_salesperson_count,
        thirty_day_hourly_inputs,
        thirty_day_top_people,
        None,
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


def create_empty_people_metrics() -> PeopleCallMetrics:
    empty_metrics: PeopleCallMetrics = PeopleCallMetrics(
        today=create_empty_period_metrics(),
        yesterday=create_empty_period_metrics(),
    )
    return empty_metrics


def accumulate_people_call_records(
    call_records: list[Any],
    windows: DashboardTimeWindows,
) -> dict[int, PeopleCallMetrics]:
    metrics_by_user: dict[int, PeopleCallMetrics] = {}
    for user_id, raw_dialed_at, duration_seconds, direction in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)
        if user_id not in metrics_by_user:
            metrics_by_user[user_id] = create_empty_people_metrics()
        user_metrics: PeopleCallMetrics = metrics_by_user[user_id]
        if dialed_at >= windows.today_start_utc:
            apply_direction_call_to_metrics(
                user_metrics.today, direction, duration_seconds
            )
        elif dialed_at >= windows.yesterday_start_utc:
            apply_direction_call_to_metrics(
                user_metrics.yesterday, direction, duration_seconds
            )
    return metrics_by_user


def build_people_row_period_block(period_metrics: dict[str, int]) -> dict[str, Any]:
    talk_minutes: float = calculate_talk_minutes(period_metrics["seconds"])
    period_block: dict[str, Any] = {
        "dials": period_metrics["dials"],
        "connected": period_metrics["connected"],
        "minutes": talk_minutes,
    }
    return period_block


def build_team_people_rows(
    active_salespeople: list[Any],
    metrics_by_user: dict[int, PeopleCallMetrics],
) -> list[dict[str, Any]]:
    people_rows: list[dict[str, Any]] = []
    for person_id, person_name in active_salespeople:
        person_metrics: PeopleCallMetrics = metrics_by_user.get(
            person_id, create_empty_people_metrics()
        )
        people_rows.append(
            {
                "user_id": person_id,
                "name": person_name,
                "today": build_people_row_period_block(person_metrics.today),
                "yesterday": build_people_row_period_block(
                    person_metrics.yesterday
                ),
            }
        )
    sorted_people_rows: list[dict[str, Any]] = sorted(
        people_rows,
        key=lambda row: (-row["today"]["dials"], row["user_id"]),
    )
    return sorted_people_rows


def get_team_people_data() -> list[dict[str, Any]]:
    windows: DashboardTimeWindows = calculate_dashboard_time_windows()
    call_records: list[Any] = fetch_team_call_records(
        windows, windows.yesterday_start_utc
    )
    metrics_by_user: dict[int, PeopleCallMetrics] = accumulate_people_call_records(
        call_records, windows
    )
    active_salespeople: list[Any] = fetch_active_salespeople()
    people_rows: list[dict[str, Any]] = build_team_people_rows(
        active_salespeople, metrics_by_user
    )
    return people_rows

