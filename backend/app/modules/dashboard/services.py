from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any
from backend.app.core.errors import AppException
from backend.app.core.utils import now_ist, parse_utc_datetime, to_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call
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
    user_today: dict[int, dict[str, int]]
    user_yesterday: dict[int, dict[str, int]]
    user_thirty_days_seconds: dict[int, int]
    hourly_today: list[int]
    hourly_yesterday: list[int]
    hourly_thirty_days: list[int]


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


def apply_call_to_hourly_bucket(
    hourly_buckets: list[int], dialed_at_utc: datetime
) -> None:
    ist_dialed_at: datetime = to_ist(dialed_at_utc)
    hour_bucket_index: int = ist_dialed_at.hour
    hourly_buckets[hour_bucket_index] += 1


def apply_call_to_user_metrics(
    user_metrics_by_user: dict[int, dict[str, int]],
    user_id: int,
    duration_seconds: int,
) -> None:
    if user_id not in user_metrics_by_user:
        user_metrics_by_user[user_id] = create_empty_period_metrics()
    apply_call_to_metrics(user_metrics_by_user[user_id], duration_seconds)


def add_user_talk_seconds(
    user_seconds_by_user: dict[int, int], user_id: int, duration_seconds: int
) -> None:
    current_seconds: int = user_seconds_by_user.get(user_id, 0)
    user_seconds_by_user[user_id] = current_seconds + duration_seconds


def collect_user_talk_seconds(
    user_metrics_by_user: dict[int, dict[str, int]]
) -> dict[int, int]:
    user_seconds_by_user: dict[int, int] = {}
    for user_id, user_metrics in user_metrics_by_user.items():
        user_seconds_by_user[user_id] = user_metrics["seconds"]
    return user_seconds_by_user


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


def create_empty_team_aggregates() -> TeamCallAggregates:
    hours_per_day: int = 24
    aggregates: TeamCallAggregates = TeamCallAggregates(
        team_today=create_empty_period_metrics(),
        team_yesterday=create_empty_period_metrics(),
        team_thirty_days=create_empty_period_metrics(),
        user_today={},
        user_yesterday={},
        user_thirty_days_seconds={},
        hourly_today=[0] * hours_per_day,
        hourly_yesterday=[0] * hours_per_day,
        hourly_thirty_days=[0] * hours_per_day,
    )
    return aggregates


def accumulate_team_call_records(
    call_records: list[Any],
    windows: DashboardTimeWindows,
) -> TeamCallAggregates:
    aggregates: TeamCallAggregates = create_empty_team_aggregates()

    for user_id, raw_dialed_at, duration_seconds in call_records:
        dialed_at: datetime = parse_utc_datetime(raw_dialed_at)

        apply_call_to_metrics(aggregates.team_thirty_days, duration_seconds)
        add_user_talk_seconds(
            aggregates.user_thirty_days_seconds, user_id, duration_seconds
        )
        apply_call_to_hourly_bucket(aggregates.hourly_thirty_days, dialed_at)

        if dialed_at >= windows.today_start_utc:
            apply_call_to_metrics(aggregates.team_today, duration_seconds)
            apply_call_to_user_metrics(aggregates.user_today, user_id, duration_seconds)
            apply_call_to_hourly_bucket(aggregates.hourly_today, dialed_at)
        elif dialed_at >= windows.yesterday_start_utc:
            apply_call_to_metrics(aggregates.team_yesterday, duration_seconds)
            apply_call_to_user_metrics(
                aggregates.user_yesterday, user_id, duration_seconds
            )
            apply_call_to_hourly_bucket(aggregates.hourly_yesterday, dialed_at)

    return aggregates


def build_people_list(
    active_people: list[Any],
    user_today: dict[int, dict[str, int]],
    user_yesterday: dict[int, dict[str, int]],
) -> list[dict[str, Any]]:
    people_list: list[dict[str, Any]] = []
    for person_id, person_name in active_people:
        person_today_data: dict[str, int] = user_today.get(
            person_id, create_empty_period_metrics()
        )
        person_yesterday_data: dict[str, int] = user_yesterday.get(
            person_id, create_empty_period_metrics()
        )
        person_summary: dict[str, Any] = {
            "id": person_id,
            "name": person_name,
            "today": person_today_data,
            "yesterday": person_yesterday_data,
        }
        people_list.append(person_summary)
    return people_list


def build_top_people_list(
    active_people: list[Any], user_seconds_by_user: dict[int, int]
) -> list[dict[str, Any]]:
    top_people_limit: int = 5
    zero_talk_seconds: int = 0
    people_with_talk_time: list[dict[str, Any]] = []
    for person_id, person_name in active_people:
        talk_seconds: int = user_seconds_by_user.get(person_id, zero_talk_seconds)
        if talk_seconds > zero_talk_seconds:
            person_entry: dict[str, Any] = {
                "id": person_id,
                "name": person_name,
                "seconds": talk_seconds,
            }
            people_with_talk_time.append(person_entry)
    ranked_people: list[dict[str, Any]] = sorted(
        people_with_talk_time,
        key=lambda entry: (-entry["seconds"], entry["id"]),
    )
    return ranked_people[:top_people_limit]


def get_team_dashboard_data() -> dict[str, Any]:
    windows: DashboardTimeWindows = calculate_dashboard_time_windows()

    call_records: list[Any] = fetch_team_call_records(windows)
    aggregates: TeamCallAggregates = accumulate_team_call_records(call_records, windows)

    active_salespeople: list[Any] = fetch_active_salespeople()

    people_list: list[dict[str, Any]] = build_people_list(
        active_salespeople, aggregates.user_today, aggregates.user_yesterday
    )
    sorted_people: list[dict[str, Any]] = sorted(
        people_list,
        key=lambda entry: entry["today"]["dials"],
        reverse=True,
    )

    top_people_payload: dict[str, Any] = {
        "today": build_top_people_list(
            active_salespeople, collect_user_talk_seconds(aggregates.user_today)
        ),
        "yesterday": build_top_people_list(
            active_salespeople, collect_user_talk_seconds(aggregates.user_yesterday)
        ),
        "last_30_days": build_top_people_list(
            active_salespeople, aggregates.user_thirty_days_seconds
        ),
    }

    calls_by_hour_payload: dict[str, Any] = {
        "today": aggregates.hourly_today,
        "yesterday": aggregates.hourly_yesterday,
        "last_30_days": aggregates.hourly_thirty_days,
    }

    response_payload: dict[str, Any] = {
        "today": aggregates.team_today,
        "yesterday": aggregates.team_yesterday,
        "last_30_days": aggregates.team_thirty_days,
        "calls_by_hour": calls_by_hour_payload,
        "top_people": top_people_payload,
        "people": sorted_people,
    }
    return response_payload


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
