from datetime import datetime, timedelta, timezone
from typing import Any
from flask import Flask, Response
from flask.testing import FlaskClient
from backend.app.core.security import hash_password
from backend.app.core.utils import now_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.users import User


def create_user_fixture(
    name: str = "testuser",
    role: str = "salesperson",
    is_active: bool = True,
    token: str = "test-token",
) -> User:
    password_hash: str = hash_password("Password123")
    user: User = User(
        name=name,
        password_hash=password_hash,
        role=role,
        country="IN",
        is_active=is_active,
        auth_token=token,
    )
    db.session.add(user)
    db.session.commit()
    return user


def create_call_record(
    call_id: str,
    user_id: int,
    phone_number: str,
    dialed_at: datetime,
    duration_seconds: int = 0,
) -> Call:
    call: Call = Call(
        call_id=call_id,
        user_id=user_id,
        phone_number=phone_number,
        dialed_at=dialed_at,
        duration_seconds=duration_seconds,
    )
    db.session.add(call)
    db.session.commit()
    return call


def create_call_records_bulk(
    call_rows: list[tuple[str, int, str, datetime, int]],
) -> None:
    call_models: list[Call] = []
    for call_id, user_id, phone_number, dialed_at, duration_seconds in call_rows:
        call_models.append(
            Call(
                call_id=call_id,
                user_id=user_id,
                phone_number=phone_number,
                dialed_at=dialed_at,
                duration_seconds=duration_seconds,
            )
        )
    db.session.add_all(call_models)
    db.session.commit()


def create_utc_call_time(days_ago: int, hour_of_day: int) -> datetime:
    ist_today_midnight: datetime = now_ist().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    ist_call_time: datetime = ist_today_midnight - timedelta(
        days=days_ago
    ) + timedelta(hours=hour_of_day)
    utc_call_time: datetime = ist_call_time.astimezone(timezone.utc)
    return utc_call_time


def test_person_dashboard_unauthenticated_rejected(client: FlaskClient) -> None:
    response: Response = client.get("/api/dashboard/person/1")
    assert response.status_code == 401
    data: dict[str, Any] = response.get_json()
    assert data.get("message") == "Invalid or expired token."


def test_person_dashboard_salesperson_access_own_stats(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        salesperson: User = create_user_fixture(
            name="sales_owner", role="salesperson", token="owner-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer owner-token"}
        target_url: str = f"/api/dashboard/person/{salesperson.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()
        assert data["name"] == "sales_owner"
        assert data["today"]["dials"] == 0
        assert data["today"]["connected_percent"] is None


def test_person_dashboard_salesperson_access_other_stats_forbidden(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        salesperson_one: User = create_user_fixture(
            name="sales_one", role="salesperson", token="sales-one-token"
        )
        salesperson_two: User = create_user_fixture(
            name="sales_two", role="salesperson", token="sales-two-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer sales-one-token"}
        target_url: str = f"/api/dashboard/person/{salesperson_two.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 403
        data: dict[str, Any] = response.get_json()
        assert (
            data.get("message")
            == "Access denied: you can only view your own statistics."
        )


def test_person_dashboard_manager_access_any_user(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager5", role="manager", token="mgr-token-5")
        salesperson: User = create_user_fixture(
            name="rep_viewed", role="salesperson", token="rep-token-viewed"
        )
        headers: dict[str, str] = {"Authorization": "Bearer mgr-token-5"}
        target_url: str = f"/api/dashboard/person/{salesperson.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()
        assert data["name"] == "rep_viewed"


def test_person_dashboard_manager_access_deactivated_user(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager6", role="manager", token="mgr-token-6")
        deactivated_user: User = create_user_fixture(
            name="inactive_rep",
            role="salesperson",
            is_active=False,
            token="inactive-token",
        )
        headers: dict[str, str] = {"Authorization": "Bearer mgr-token-6"}
        target_url: str = f"/api/dashboard/person/{deactivated_user.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()
        assert data["name"] == "inactive_rep"


def test_person_dashboard_user_not_found(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(name="manager7", role="manager", token="mgr-token-7")
        headers: dict[str, str] = {"Authorization": "Bearer mgr-token-7"}
        target_url: str = "/api/dashboard/person/999999"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 404
        data: dict[str, Any] = response.get_json()
        assert data.get("message") == "User not found."


def test_person_dashboard_three_period_stats_and_rounding(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_stats", role="salesperson", token="rep-stats-token"
        )
        ist_now: datetime = now_ist()
        today_midnight_ist: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        today_time: datetime = (today_midnight_ist + timedelta(hours=2)).astimezone(
            timezone.utc
        )
        yesterday_time: datetime = (
            today_midnight_ist - timedelta(hours=2)
        ).astimezone(timezone.utc)
        ten_days_ago_time: datetime = (
            today_midnight_ist - timedelta(days=10)
        ).astimezone(timezone.utc)

        create_call_record("call-t-1", rep.id, "+919876543201", today_time, 100)
        create_call_record("call-t-2", rep.id, "+919876543202", today_time, 50)
        create_call_record("call-t-3", rep.id, "+919876543203", today_time, 0)

        create_call_record("call-y-1", rep.id, "+919876543204", yesterday_time, 80)
        create_call_record("call-y-2", rep.id, "+919876543205", yesterday_time, 0)

        create_call_record("call-old-1", rep.id, "+919876543206", ten_days_ago_time, 200)

        headers: dict[str, str] = {"Authorization": "Bearer rep-stats-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["today"]["dials"] == 3
        assert data["today"]["connected"] == 2
        assert data["today"]["seconds"] == 150
        assert data["today"]["connected_percent"] == 67

        assert data["yesterday"]["dials"] == 2
        assert data["yesterday"]["connected"] == 1
        assert data["yesterday"]["seconds"] == 80
        assert data["yesterday"]["connected_percent"] == 50

        assert data["last_30_days"]["dials"] == 6
        assert data["last_30_days"]["connected"] == 4
        assert data["last_30_days"]["seconds"] == 430
        assert data["last_30_days"]["connected_percent"] == 67


def test_person_dashboard_top_five_numbers(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_top_numbers", role="salesperson", token="rep-top-token"
        )
        call_time: datetime = now_ist().astimezone(timezone.utc)

        numbers_and_durations: list[tuple[str, int, int]] = [
            ("+919876543211", 500, 2),
            ("+919876543212", 400, 1),
            ("+919876543213", 300, 3),
            ("+919876543214", 200, 1),
            ("+919876543215", 100, 1),
            ("+919876543216", 50, 1),
            ("+919876543217", 10, 1),
        ]

        counter: int = 1
        for phone, duration, calls_count in numbers_and_durations:
            for _ in range(calls_count):
                create_call_record(
                    f"c-top-{counter}",
                    rep.id,
                    phone,
                    call_time,
                    duration // calls_count,
                )
                counter += 1

        headers: dict[str, str] = {"Authorization": "Bearer rep-top-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        top_numbers: list[dict[str, Any]] = data["top_numbers"]
        assert len(top_numbers) == 5

        expected_first_five: list[str] = [
            "+919876543211",
            "+919876543212",
            "+919876543213",
            "+919876543214",
            "+919876543215",
        ]
        returned_numbers: list[str] = [item["phone_number"] for item in top_numbers]
        assert returned_numbers == expected_first_five
        assert top_numbers[0]["seconds"] == 500
        assert top_numbers[0]["minutes"] == 8
        assert top_numbers[0]["calls"] == 2


def test_person_dashboard_fewer_than_five_numbers(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_few_numbers", role="salesperson", token="rep-few-token"
        )
        call_time: datetime = now_ist().astimezone(timezone.utc)

        create_call_record("c-few-1", rep.id, "+919876543211", call_time, 250)
        create_call_record("c-few-2", rep.id, "+919876543212", call_time, 150)

        headers: dict[str, str] = {"Authorization": "Bearer rep-few-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        top_numbers: list[dict[str, Any]] = data["top_numbers"]
        assert len(top_numbers) == 2
        assert top_numbers[0]["phone_number"] == "+919876543211"
        assert top_numbers[0]["seconds"] == 250
        assert top_numbers[0]["minutes"] == 4
        assert top_numbers[0]["calls"] == 1
        assert top_numbers[1]["phone_number"] == "+919876543212"
        assert top_numbers[1]["seconds"] == 150
        assert top_numbers[1]["minutes"] == 2
        assert top_numbers[1]["calls"] == 1


def test_person_dashboard_zero_dials_returns_null_percent(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_zero_dials", role="salesperson", token="rep-zero-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer rep-zero-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()
        assert data["today"]["dials"] == 0
        assert data["today"]["connected_percent"] is None
        assert data["yesterday"]["dials"] == 0
        assert data["yesterday"]["connected_percent"] is None
        assert data["last_30_days"]["dials"] == 0
        assert data["last_30_days"]["connected_percent"] is None
        assert data["top_numbers"] == []


def test_person_dashboard_connected_derived_from_duration(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_duration_derive", role="salesperson", token="rep-dur-token"
        )
        call_time: datetime = now_ist().astimezone(timezone.utc)
        create_call_record("c-zero-dur", rep.id, "+919876543210", call_time, 0)
        create_call_record("c-pos-dur", rep.id, "+919876543211", call_time, 1)

        headers: dict[str, str] = {"Authorization": "Bearer rep-dur-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()
        assert data["today"]["dials"] == 2
        assert data["today"]["connected"] == 1
        assert data["today"]["seconds"] == 1
        assert data["today"]["connected_percent"] == 50


def test_person_dashboard_no_calls_returns_zero_active_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_no_calls", role="salesperson", token="rep-no-calls-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer rep-no-calls-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["name"] == "rep_no_calls"
        assert data["last_30_days"]["active_days"] == 0
        assert data["last_30_days"]["dials"] == 0
        assert data["last_30_days"]["connected"] == 0
        assert data["last_30_days"]["seconds"] == 0
        assert data["last_30_days"]["connected_percent"] is None
        assert data["last_30_days"]["avg_per_active_day"] is None
        assert data["last_30_days"]["calls_by_hour"]["hours"] == list(range(10, 20))
        assert data["last_30_days"]["calls_by_hour"]["dials"] == [0] * 10
        assert data["last_30_days"]["calls_by_hour"]["best_hour"] is None
        assert data["today"]["dials"] == 0
        assert data["today"]["not_connected"] == 0
        assert data["today"]["minutes"] == 0
        assert data["today"]["calls_by_hour"]["best_hour"] is None
        assert data["yesterday"]["dials"] == 0
        assert data["top_numbers"] == []


def test_person_dashboard_active_days_counts_distinct_ist_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_active_days", role="salesperson", token="rep-active-days-token"
        )
        ist_now: datetime = now_ist()
        today_midnight_ist: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        offset_from_midnight: timedelta = timedelta(hours=3)
        ten_days_back: timedelta = timedelta(days=10)

        today_time: datetime = (
            today_midnight_ist + offset_from_midnight
        ).astimezone(timezone.utc)
        ten_days_ago_time: datetime = (
            today_midnight_ist - ten_days_back - offset_from_midnight
        ).astimezone(timezone.utc)

        create_call_record("call-ad-1", rep.id, "+919876543201", today_time, 30)
        create_call_record("call-ad-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("call-ad-3", rep.id, "+919876543203", ten_days_ago_time, 20)

        headers: dict[str, str] = {"Authorization": "Bearer rep-active-days-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["last_30_days"]["active_days"] == 2
        assert data["last_30_days"]["dials"] == 3
        assert data["last_30_days"]["seconds"] == 90


def test_person_dashboard_active_days_respects_thirty_day_window(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_window", role="salesperson", token="rep-window-token"
        )
        ist_now: datetime = now_ist()
        today_midnight_ist: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        oldest_in_window_time: datetime = (
            today_midnight_ist - timedelta(days=29)
        ).astimezone(timezone.utc)
        outside_window_time: datetime = (
            today_midnight_ist - timedelta(days=30)
        ).astimezone(timezone.utc)

        create_call_record(
            "call-win-1", rep.id, "+919876543201", oldest_in_window_time, 30
        )
        create_call_record(
            "call-win-2", rep.id, "+919876543202", outside_window_time, 30
        )

        headers: dict[str, str] = {"Authorization": "Bearer rep-window-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["last_30_days"]["active_days"] == 1
        assert data["last_30_days"]["dials"] == 1


def test_person_dashboard_period_blocks_carry_minutes_and_not_connected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_minutes", role="salesperson", token="rep-minutes-token"
        )
        ist_now: datetime = now_ist()
        today_midnight_ist: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        today_time: datetime = now_ist().astimezone(timezone.utc)
        yesterday_time: datetime = (
            today_midnight_ist - timedelta(hours=2)
        ).astimezone(timezone.utc)

        create_call_record("pm-t-1", rep.id, "+919876543201", today_time, 100)
        create_call_record("pm-t-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("pm-t-3", rep.id, "+919876543203", today_time, 0)
        create_call_record("pm-y-1", rep.id, "+919876543204", yesterday_time, 45)

        headers: dict[str, str] = {"Authorization": "Bearer rep-minutes-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["today"]["dials"] == 3
        assert data["today"]["connected"] == 2
        assert data["today"]["not_connected"] == 1
        assert data["today"]["seconds"] == 140
        assert data["today"]["minutes"] == 2

        assert data["yesterday"]["dials"] == 1
        assert data["yesterday"]["connected"] == 1
        assert data["yesterday"]["not_connected"] == 0
        assert data["yesterday"]["seconds"] == 45
        assert data["yesterday"]["minutes"] == 1

        assert data["last_30_days"]["dials"] == 4
        assert data["last_30_days"]["connected"] == 3
        assert data["last_30_days"]["not_connected"] == 1
        assert data["last_30_days"]["seconds"] == 185
        assert data["last_30_days"]["minutes"] == 3


def test_person_dashboard_period_calls_by_hour_buckets(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_hours", role="salesperson", token="rep-hours-p-token"
        )

        afternoon_hour: int = 14
        morning_hour: int = 9
        evening_hour: int = 21

        today_afternoon: datetime = create_utc_call_time(0, afternoon_hour)
        today_morning: datetime = create_utc_call_time(0, morning_hour)
        today_evening: datetime = create_utc_call_time(0, evening_hour)
        yesterday_afternoon: datetime = create_utc_call_time(1, afternoon_hour)

        create_call_record("ph-1", rep.id, "+919876543201", today_afternoon, 30)
        create_call_record("ph-2", rep.id, "+919876543202", today_morning, 30)
        create_call_record("ph-3", rep.id, "+919876543203", today_evening, 30)
        create_call_record("ph-4", rep.id, "+919876543204", yesterday_afternoon, 30)

        headers: dict[str, str] = {"Authorization": "Bearer rep-hours-p-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        default_window_hours: list[int] = list(range(10, 20))

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == default_window_hours
        today_dials: list[int] = today_calls_by_hour["dials"]
        assert len(today_dials) == 10
        assert sum(today_dials) == 1
        assert today_dials[afternoon_hour - 10] == 1
        assert today_calls_by_hour["best_hour"] == afternoon_hour
        assert data["today"]["dials"] == 3

        yesterday_calls_by_hour: dict[str, Any] = data["yesterday"]["calls_by_hour"]
        yesterday_dials: list[int] = yesterday_calls_by_hour["dials"]
        assert sum(yesterday_dials) == 1
        assert yesterday_dials[afternoon_hour - 10] == 1
        assert yesterday_calls_by_hour["best_hour"] == afternoon_hour


def test_person_dashboard_hours_follow_stored_office_window(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_window_p", role="manager", token="mgr-token-window-p"
        )
        rep: User = create_user_fixture(
            name="rep_window_p", role="salesperson", token="rep-token-window-p"
        )
        put_headers: dict[str, str] = {"Authorization": "Bearer mgr-token-window-p"}
        put_response: Response = client.put(
            "/api/settings/office-hours",
            json={"start_time": "08:00", "end_time": "12:00"},
            headers=put_headers,
        )
        assert put_response.status_code == 200

        in_window_hour: int = 9
        outside_window_hour: int = 14
        today_in_window: datetime = create_utc_call_time(0, in_window_hour)
        today_outside: datetime = create_utc_call_time(0, outside_window_hour)

        create_call_record("pw-1", rep.id, "+919876543201", today_in_window, 30)
        create_call_record("pw-2", rep.id, "+919876543202", today_outside, 30)

        headers: dict[str, str] = {"Authorization": "Bearer rep-token-window-p"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == [8, 9, 10, 11, 12]
        assert today_calls_by_hour["dials"] == [0, 1, 0, 0, 0]
        assert today_calls_by_hour["best_hour"] == in_window_hour
        assert data["today"]["dials"] == 2


def test_person_dashboard_last_30_days_calls_by_hour_daily_averages(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_avg_hours_p", role="salesperson", token="rep-avg-hours-p-token"
        )

        peak_hour: int = 12
        mid_hour: int = 15
        low_hour: int = 18
        hour_plan: list[tuple[int, int]] = [
            (peak_hour, 60),
            (mid_hour, 30),
            (low_hour, 14),
        ]

        bulk_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter: int = 1
        for hour_of_day, call_count in hour_plan:
            hour_call_time: datetime = create_utc_call_time(0, hour_of_day)
            for _ in range(call_count):
                bulk_rows.append(
                    (
                        f"avg-p-{row_counter}",
                        rep.id,
                        "+919876543210",
                        hour_call_time,
                        30,
                    )
                )
                row_counter += 1
        create_call_records_bulk(bulk_rows)

        headers: dict[str, str] = {"Authorization": "Bearer rep-avg-hours-p-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        today_dials: list[int] = data["today"]["calls_by_hour"]["dials"]
        assert today_dials == [0, 0, 60, 0, 0, 30, 0, 0, 14, 0]
        assert data["today"]["calls_by_hour"]["best_hour"] == peak_hour

        thirty_day_dials: list[int] = data["last_30_days"]["calls_by_hour"]["dials"]
        expected_averages: list[int] = [0, 0, 2, 0, 0, 1, 0, 0, 0, 0]
        assert thirty_day_dials == expected_averages
        assert data["last_30_days"]["calls_by_hour"]["best_hour"] == peak_hour


def test_person_dashboard_avg_per_active_day_computed(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_avg_day", role="salesperson", token="rep-avg-day-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        ten_days_ago_time: datetime = create_utc_call_time(10, 11)

        create_call_record("apd-1", rep.id, "+919876543201", today_time, 30)
        create_call_record("apd-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("apd-3", rep.id, "+919876543203", ten_days_ago_time, 0)

        headers: dict[str, str] = {"Authorization": "Bearer rep-avg-day-token"}
        target_url: str = f"/api/dashboard/person/{rep.id}"
        response: Response = client.get(target_url, headers=headers)
        assert response.status_code == 200
        data: dict[str, Any] = response.get_json()

        assert data["last_30_days"]["active_days"] == 2
        assert data["last_30_days"]["avg_per_active_day"] == {
            "dials": 2,
            "connected": 1,
            "minutes": 1,
        }
        assert "avg_per_active_day" not in data["today"]
        assert "avg_per_active_day" not in data["yesterday"]
        assert "active_days" not in data["today"]
        assert "active_days" not in data["yesterday"]
