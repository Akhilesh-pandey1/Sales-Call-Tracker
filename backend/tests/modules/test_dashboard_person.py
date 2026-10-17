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
        assert top_numbers[0]["calls"] == 1
        assert top_numbers[1]["phone_number"] == "+919876543212"
        assert top_numbers[1]["seconds"] == 150
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
        assert data["today"]["dials"] == 0
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
