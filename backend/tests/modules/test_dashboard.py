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


def fetch_team_dashboard(
    client: FlaskClient, manager_token: str
) -> tuple[Response, dict[str, Any]]:
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response: Response = client.get("/api/dashboard/team", headers=headers)
    response_json: dict[str, Any] = response.get_json()
    return response, response_json


def fetch_team_people(
    client: FlaskClient, manager_token: str
) -> tuple[Response, list[dict[str, Any]]]:
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response: Response = client.get("/api/dashboard/team/people", headers=headers)
    response_json: list[dict[str, Any]] = response.get_json()
    return response, response_json


def test_team_people_unauthenticated_rejected(client: FlaskClient) -> None:
    response: Response = client.get("/api/dashboard/team/people")
    expected_status: int = 401
    assert response.status_code == expected_status
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_team_dashboard_unauthenticated_rejected(client: FlaskClient) -> None:
    response: Response = client.get("/api/dashboard/team")
    expected_status: int = 401
    assert response.status_code == expected_status
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_team_dashboard_salesperson_rejected(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(
            name="salesperson1", role="salesperson", token="sales-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}
        response: Response = client.get("/api/dashboard/team", headers=headers)
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_team_people_salesperson_rejected(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_salesperson", role="salesperson", token="people-sales-token"
        )
        headers: dict[str, str] = {"Authorization": "Bearer people-sales-token"}
        response: Response = client.get("/api/dashboard/team/people", headers=headers)
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "This dashboard is for managers."


def test_team_dashboard_deactivated_manager_rejected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_inactive",
            role="manager",
            is_active=False,
            token="inactive-mgr-token",
        )
        headers: dict[str, str] = {"Authorization": "Bearer inactive-mgr-token"}
        response: Response = client.get("/api/dashboard/team", headers=headers)
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert (
            response_json.get("message")
            == "Your account is not active. Please contact your manager."
        )


def test_team_people_empty_list_when_no_salespeople(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="people_mgr_empty", role="manager", token="mgr-empty-token")
        response, data = fetch_team_people(client, "mgr-empty-token")
        expected_status: int = 200
        assert response.status_code == expected_status
        assert data == []


def test_team_people_lists_every_active_salesperson_with_zeros(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        manager: User = create_user_fixture(
            name="people_mgr_rows", role="manager", token="mgr-rows-token"
        )
        calling_rep: User = create_user_fixture(
            name="rep_caller", role="salesperson", token="rep-caller-token"
        )
        silent_rep: User = create_user_fixture(
            name="rep_silent", role="salesperson", token="rep-silent-token"
        )
        deactivated_rep: User = create_user_fixture(
            name="rep_deactivated_rows",
            role="salesperson",
            is_active=False,
            token="rep-deact-rows-token",
        )

        today_time: datetime = create_utc_call_time(0, 11)
        yesterday_time: datetime = create_utc_call_time(1, 11)

        create_call_record("pr-1", calling_rep.id, "+919876543201", today_time, 100)
        create_call_record("pr-2", calling_rep.id, "+919876543202", today_time, 0)
        create_call_record("pr-3", calling_rep.id, "+919876543203", yesterday_time, 60)
        create_call_record(
            "pr-4", deactivated_rep.id, "+919876543204", today_time, 300
        )
        create_call_record("pr-5", manager.id, "+919876543205", today_time, 300)

        response, data = fetch_team_people(client, "mgr-rows-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        expected_row_count: int = 2
        assert len(data) == expected_row_count

        returned_user_ids: set[int] = {row["user_id"] for row in data}
        expected_user_ids: set[int] = {calling_rep.id, silent_rep.id}
        assert returned_user_ids == expected_user_ids

        caller_row: dict[str, Any] = next(
            row for row in data if row["user_id"] == calling_rep.id
        )
        assert set(caller_row.keys()) == {"user_id", "name", "today", "yesterday"}
        assert caller_row["name"] == "rep_caller"
        assert caller_row["today"]["dials"] == 2
        assert caller_row["today"]["connected"] == 1
        assert caller_row["yesterday"]["dials"] == 1
        assert caller_row["yesterday"]["connected"] == 1

        silent_row: dict[str, Any] = next(
            row for row in data if row["user_id"] == silent_rep.id
        )
        assert silent_row["name"] == "rep_silent"
        assert silent_row["today"]["dials"] == 0
        assert silent_row["today"]["connected"] == 0
        assert silent_row["yesterday"]["dials"] == 0
        assert silent_row["yesterday"]["connected"] == 0


def test_team_people_period_blocks_carry_only_dials_connected_minutes(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_mgr_block", role="manager", token="mgr-block-token"
        )
        rep: User = create_user_fixture(
            name="rep_block", role="salesperson", token="rep-block-token"
        )

        today_time: datetime = create_utc_call_time(0, 12)
        yesterday_time: datetime = create_utc_call_time(1, 12)

        create_call_record("pb-1", rep.id, "+919876543210", today_time, 115)
        create_call_record("pb-2", rep.id, "+919876543211", today_time, 115)
        create_call_record("pb-3", rep.id, "+919876543212", yesterday_time, 45)

        response, data = fetch_team_people(client, "mgr-block-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        expected_period_keys: set[str] = {"dials", "connected", "minutes"}
        rep_row: dict[str, Any] = data[0]
        today_block: dict[str, Any] = rep_row["today"]
        yesterday_block: dict[str, Any] = rep_row["yesterday"]

        assert set(today_block.keys()) == expected_period_keys
        assert set(yesterday_block.keys()) == expected_period_keys

        expected_today_minutes: float = 3.83
        expected_yesterday_minutes: float = 0.75
        assert today_block == {
            "dials": 2,
            "connected": 2,
            "minutes": expected_today_minutes,
        }
        assert yesterday_block == {
            "dials": 1,
            "connected": 1,
            "minutes": expected_yesterday_minutes,
        }


def test_team_people_rows_sorted_by_today_dials_highest_first(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_mgr_sort", role="manager", token="mgr-sort-token"
        )
        low_rep: User = create_user_fixture(
            name="rep_sort_low", role="salesperson", token="rep-sort-low-token"
        )
        high_rep: User = create_user_fixture(
            name="rep_sort_high", role="salesperson", token="rep-sort-high-token"
        )
        mid_rep: User = create_user_fixture(
            name="rep_sort_mid", role="salesperson", token="rep-sort-mid-token"
        )
        silent_rep: User = create_user_fixture(
            name="rep_sort_silent", role="salesperson", token="rep-sort-silent-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        create_call_record("ps-1", low_rep.id, "+919876543210", today_time, 30)
        create_call_record("ps-2", high_rep.id, "+919876543211", today_time, 30)
        create_call_record("ps-3", high_rep.id, "+919876543212", today_time, 30)
        create_call_record("ps-4", high_rep.id, "+919876543213", today_time, 30)
        create_call_record("ps-5", mid_rep.id, "+919876543214", today_time, 30)
        create_call_record("ps-6", mid_rep.id, "+919876543215", today_time, 30)

        response, data = fetch_team_people(client, "mgr-sort-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        expected_dials_order: list[int] = [3, 2, 1, 0]
        returned_dials_order: list[int] = [row["today"]["dials"] for row in data]
        assert returned_dials_order == expected_dials_order

        expected_user_order: list[int] = [
            high_rep.id,
            mid_rep.id,
            low_rep.id,
            silent_rep.id,
        ]
        returned_user_order: list[int] = [row["user_id"] for row in data]
        assert returned_user_order == expected_user_order


def test_team_people_ist_day_boundary_respected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_mgr_boundary", role="manager", token="mgr-boundary-token"
        )
        rep: User = create_user_fixture(
            name="rep_boundary_people",
            role="salesperson",
            token="rep-boundary-people-token",
        )

        ist_now: datetime = now_ist()
        ist_today_midnight: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        yesterday_late_ist: datetime = ist_today_midnight - timedelta(minutes=5)
        today_early_ist: datetime = ist_today_midnight + timedelta(minutes=5)

        yesterday_utc: datetime = yesterday_late_ist.astimezone(timezone.utc)
        today_utc: datetime = today_early_ist.astimezone(timezone.utc)

        create_call_record("pbd-1", rep.id, "+919876543210", yesterday_utc, 40)
        create_call_record("pbd-2", rep.id, "+919876543211", today_utc, 80)

        response, data = fetch_team_people(client, "mgr-boundary-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        rep_row: dict[str, Any] = data[0]
        assert rep_row["today"]["dials"] == 1
        assert rep_row["today"]["minutes"] == 1.33
        assert rep_row["yesterday"]["dials"] == 1
        assert rep_row["yesterday"]["minutes"] == 0.67


def test_team_people_short_call_shows_decimal_minutes(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_mgr_short", role="manager", token="mgr-people-short-token"
        )
        rep: User = create_user_fixture(
            name="rep_people_short",
            role="salesperson",
            token="rep-people-short-token",
        )

        call_time: datetime = create_utc_call_time(0, 12)
        create_call_record("people-short-1", rep.id, "+919876543210", call_time, 20)

        response, data = fetch_team_people(client, "mgr-people-short-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        rep_row: dict[str, Any] = data[0]
        assert rep_row["today"]["dials"] == 1
        assert rep_row["today"]["minutes"] == 0.33


def test_team_dashboard_empty_response_shape(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="mgr-token-1")
        create_user_fixture(name="rep1", role="salesperson", token="rep-token-1")
        response, data = fetch_team_dashboard(client, "mgr-token-1")
        expected_status: int = 200
        assert response.status_code == expected_status

        assert "people" not in data
        assert set(data.keys()) == {"today", "yesterday", "last_30_days"}

        default_window_hours: list[int] = list(range(10, 20))

        for period_name in ["today", "yesterday", "last_30_days"]:
            period: dict[str, Any] = data[period_name]
            assert period["dials"] == 0
            assert period["connected"] == 0
            assert period["not_connected"] == 0
            assert period["seconds"] == 0
            assert period["minutes"] == 0
            assert period["connected_percent"] is None
            assert period["avg_per_person_per_day"] == {
                "dials": 0,
                "connected": 0,
                "not_connected": 0,
                "minutes": 0,
            }
            assert period["calls_by_hour"]["hours"] == default_window_hours
            assert period["calls_by_hour"]["dials"] == [0] * 10
            assert period["calls_by_hour"]["best_hour"] is None
            assert period["top_people"] == []

        assert data["today"]["vs_yesterday"] == {
            "dials": 0,
            "connected": 0,
            "not_connected": 0,
            "minutes": 0,
        }
        assert data["yesterday"]["vs_yesterday"] is None
        assert data["last_30_days"]["vs_yesterday"] is None


def test_team_dashboard_period_kpis_and_vs_yesterday(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_kpi", role="manager", token="mgr-token-kpi")
        rep: User = create_user_fixture(
            name="rep_kpi", role="salesperson", token="rep-kpi-token"
        )
        silent_rep: User = create_user_fixture(
            name="rep_kpi_silent", role="salesperson", token="rep-kpi-silent-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        yesterday_time: datetime = create_utc_call_time(1, 11)

        create_call_record("kpi-t-1", rep.id, "+919876543201", today_time, 100)
        create_call_record("kpi-t-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("kpi-t-3", rep.id, "+919876543203", today_time, 0)
        create_call_record("kpi-y-1", rep.id, "+919876543204", yesterday_time, 60)

        response, data = fetch_team_dashboard(client, "mgr-token-kpi")
        assert response.status_code == 200

        today: dict[str, Any] = data["today"]
        assert today["dials"] == 3
        assert today["connected"] == 2
        assert today["not_connected"] == 1
        assert today["seconds"] == 140
        assert today["minutes"] == 2.33
        assert today["connected_percent"] == 67

        assert today["vs_yesterday"] == {
            "dials": 2,
            "connected": 1,
            "not_connected": 1,
            "minutes": 1.33,
        }

        assert today["avg_per_person_per_day"] == {
            "dials": 2,
            "connected": 1,
            "not_connected": 0,
            "minutes": 1.17,
        }

        today_top_ids: list[int] = [person["id"] for person in today["top_people"]]
        assert rep.id in today_top_ids
        assert silent_rep.id not in today_top_ids

        yesterday: dict[str, Any] = data["yesterday"]
        assert yesterday["dials"] == 1
        assert yesterday["connected"] == 1
        assert yesterday["not_connected"] == 0
        assert yesterday["seconds"] == 60
        assert yesterday["minutes"] == 1
        assert yesterday["connected_percent"] == 100
        assert yesterday["vs_yesterday"] is None

        thirty_days: dict[str, Any] = data["last_30_days"]
        assert thirty_days["dials"] == 4
        assert thirty_days["connected"] == 3
        assert thirty_days["not_connected"] == 1
        assert thirty_days["seconds"] == 200
        assert thirty_days["minutes"] == 3.33
        assert thirty_days["connected_percent"] == 75
        assert thirty_days["vs_yesterday"] is None

        assert thirty_days["avg_per_person_per_day"] == {
            "dials": 0,
            "connected": 0,
            "not_connected": 0,
            "minutes": 0.06,
        }


def test_team_dashboard_short_call_shows_decimal_minutes(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_short", role="manager", token="mgr-short-token")
        rep: User = create_user_fixture(
            name="rep_short", role="salesperson", token="rep-short-token"
        )

        call_time: datetime = create_utc_call_time(0, 12)
        create_call_record("short-1", rep.id, "+919876543210", call_time, 20)

        response, data = fetch_team_dashboard(client, "mgr-short-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        assert data["today"]["connected"] == 1
        assert data["today"]["minutes"] == 0.33
        assert data["today"]["vs_yesterday"]["minutes"] == 0.33

        today_top: list[dict[str, Any]] = data["today"]["top_people"]
        assert today_top[0]["seconds"] == 20
        assert today_top[0]["minutes"] == 0.33


def test_team_dashboard_avg_per_person_per_day_counts_all_active(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_avg", role="manager", token="mgr-token-avg")
        rep: User = create_user_fixture(
            name="rep_avg", role="salesperson", token="rep-avg-token"
        )
        second_rep: User = create_user_fixture(
            name="rep_avg_two", role="salesperson", token="rep-avg-two-token"
        )

        call_time: datetime = create_utc_call_time(0, 12)
        active_reps: list[int] = [rep.id, second_rep.id]
        bulk_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter: int = 1
        for rep_id in active_reps:
            for _ in range(60):
                bulk_rows.append(
                    (
                        f"avg-{row_counter}",
                        rep_id,
                        "+919876543210",
                        call_time,
                        60,
                    )
                )
                row_counter += 1
        create_call_records_bulk(bulk_rows)

        response, data = fetch_team_dashboard(client, "mgr-token-avg")
        assert response.status_code == 200

        assert data["today"]["dials"] == 120
        assert data["today"]["avg_per_person_per_day"]["dials"] == 60
        assert data["today"]["avg_per_person_per_day"]["connected"] == 60
        assert data["today"]["avg_per_person_per_day"]["minutes"] == 60

        assert data["last_30_days"]["dials"] == 120
        assert data["last_30_days"]["avg_per_person_per_day"]["dials"] == 2
        assert data["last_30_days"]["avg_per_person_per_day"]["minutes"] == 2


def test_team_dashboard_team_totals_include_deactivated_salesperson(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager2", role="manager", token="mgr-token-2")
        active_rep: User = create_user_fixture(
            name="active_rep", role="salesperson", token="active-rep-token"
        )
        deactivated_rep: User = create_user_fixture(
            name="deactivated_rep",
            role="salesperson",
            is_active=False,
            token="deact-rep-token",
        )

        today_call_time_utc: datetime = now_ist().astimezone(timezone.utc)

        create_call_record(
            "call-active-1",
            active_rep.id,
            "+919876543210",
            today_call_time_utc,
            120,
        )
        create_call_record(
            "call-deact-1",
            deactivated_rep.id,
            "+919876543211",
            today_call_time_utc,
            60,
        )

        response, data = fetch_team_dashboard(client, "mgr-token-2")
        assert response.status_code == 200

        assert "people" not in data
        assert data["today"]["dials"] == 2
        assert data["today"]["connected"] == 2
        assert data["today"]["not_connected"] == 0
        assert data["today"]["seconds"] == 180
        assert data["today"]["minutes"] == 3

        today_top: list[dict[str, Any]] = data["today"]["top_people"]
        assert len(today_top) == 1
        assert today_top[0]["id"] == active_rep.id
        assert today_top[0]["seconds"] == 120


def test_team_dashboard_ist_day_boundary_respected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager3", role="manager", token="mgr-token-3")
        rep: User = create_user_fixture(
            name="rep_boundary", role="salesperson", token="rep-boundary-token"
        )

        ist_now: datetime = now_ist()
        ist_today_midnight: datetime = ist_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        yesterday_late_ist: datetime = ist_today_midnight - timedelta(minutes=5)
        today_early_ist: datetime = ist_today_midnight + timedelta(minutes=5)

        yesterday_utc: datetime = yesterday_late_ist.astimezone(timezone.utc)
        today_utc: datetime = today_early_ist.astimezone(timezone.utc)

        create_call_record("call-yesterday", rep.id, "+919876543210", yesterday_utc, 45)
        create_call_record("call-today", rep.id, "+919876543211", today_utc, 100)

        response, data = fetch_team_dashboard(client, "mgr-token-3")
        assert response.status_code == 200

        assert data["today"]["dials"] == 1
        assert data["today"]["seconds"] == 100
        assert data["today"]["minutes"] == 1.67
        assert data["yesterday"]["dials"] == 1
        assert data["yesterday"]["seconds"] == 45
        assert data["yesterday"]["minutes"] == 0.75

        assert data["last_30_days"]["dials"] == 2
        assert data["last_30_days"]["seconds"] == 145


def test_team_dashboard_calls_by_hour_window_buckets(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager10", role="manager", token="mgr-token-10")
        rep: User = create_user_fixture(
            name="rep_hours", role="salesperson", token="rep-hours-token"
        )

        afternoon_hour: int = 14
        morning_hour: int = 9
        evening_hour: int = 23
        early_morning_hour: int = 5

        today_afternoon: datetime = create_utc_call_time(0, afternoon_hour)
        today_morning: datetime = create_utc_call_time(0, morning_hour)
        today_evening: datetime = create_utc_call_time(0, evening_hour)
        today_early_morning: datetime = create_utc_call_time(0, early_morning_hour)
        yesterday_afternoon: datetime = create_utc_call_time(1, afternoon_hour)

        create_call_record("ch-1", rep.id, "+919876543210", today_afternoon, 30)
        create_call_record("ch-2", rep.id, "+919876543211", today_morning, 30)
        create_call_record("ch-3", rep.id, "+919876543212", today_evening, 30)
        create_call_record("ch-4", rep.id, "+919876543213", today_early_morning, 30)
        create_call_record("ch-5", rep.id, "+919876543214", yesterday_afternoon, 30)

        response, data = fetch_team_dashboard(client, "mgr-token-10")
        assert response.status_code == 200

        today_hours: list[int] = data["today"]["calls_by_hour"]["hours"]
        assert today_hours == list(range(10, 20))

        today_dials: list[int] = data["today"]["calls_by_hour"]["dials"]
        assert len(today_dials) == 10
        assert sum(today_dials) == 1
        assert today_dials[afternoon_hour - 10] == 1
        assert data["today"]["calls_by_hour"]["best_hour"] == afternoon_hour

        yesterday_dials: list[int] = data["yesterday"]["calls_by_hour"]["dials"]
        assert sum(yesterday_dials) == 1
        assert yesterday_dials[afternoon_hour - 10] == 1
        assert data["yesterday"]["calls_by_hour"]["best_hour"] == afternoon_hour


def test_team_dashboard_hours_follow_stored_office_window(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_window", role="manager", token="mgr-token-window"
        )
        rep: User = create_user_fixture(
            name="rep_window", role="salesperson", token="rep-window-token"
        )

        put_headers: dict[str, str] = {"Authorization": "Bearer mgr-token-window"}
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

        create_call_record("cw-1", rep.id, "+919876543210", today_in_window, 30)
        create_call_record("cw-2", rep.id, "+919876543211", today_outside, 30)

        response, data = fetch_team_dashboard(client, "mgr-token-window")
        assert response.status_code == 200

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == [8, 9, 10, 11, 12]
        assert today_calls_by_hour["dials"] == [0, 1, 0, 0, 0]
        assert today_calls_by_hour["best_hour"] == in_window_hour


def test_team_dashboard_last_30_days_totals_include_deactivated_salesperson(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager9", role="manager", token="mgr-token-9")
        active_rep: User = create_user_fixture(
            name="rep_active30", role="salesperson", token="rep-active30-token"
        )
        deactivated_rep: User = create_user_fixture(
            name="rep_deact30",
            role="salesperson",
            is_active=False,
            token="rep-deact30-token",
        )

        today_time: datetime = create_utc_call_time(0, 10)
        yesterday_time: datetime = create_utc_call_time(1, 10)
        old_call_time: datetime = create_utc_call_time(10, 10)
        deactivated_call_time: datetime = create_utc_call_time(10, 16)

        create_call_record("c30-1", active_rep.id, "+919876543210", today_time, 120)
        create_call_record("c30-2", active_rep.id, "+919876543211", yesterday_time, 60)
        create_call_record("c30-3", active_rep.id, "+919876543212", old_call_time, 200)
        create_call_record(
            "c30-4", deactivated_rep.id, "+919876543213", deactivated_call_time, 50
        )

        response, data = fetch_team_dashboard(client, "mgr-token-9")
        expected_status: int = 200
        assert response.status_code == expected_status

        assert data["last_30_days"]["dials"] == 4
        assert data["last_30_days"]["connected"] == 4
        assert data["last_30_days"]["seconds"] == 430
        assert data["last_30_days"]["minutes"] == 7.17

        thirty_day_dials: list[int] = data["last_30_days"]["calls_by_hour"]["dials"]
        assert thirty_day_dials == [0] * 10

        thirty_day_top: list[dict[str, Any]] = data["last_30_days"]["top_people"]
        assert len(thirty_day_top) == 1
        assert thirty_day_top[0]["id"] == active_rep.id
        assert thirty_day_top[0]["seconds"] == 380
        assert thirty_day_top[0]["minutes"] == 6.33


def test_team_dashboard_last_30_days_dials_are_daily_averages(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_avg_hours", role="manager", token="mgr-token-avg-hours"
        )
        rep: User = create_user_fixture(
            name="rep_avg_hours", role="salesperson", token="rep-avg-hours-token"
        )

        peak_hour: int = 12
        mid_hour: int = 15
        low_hour: int = 18

        peak_calls: int = 60
        mid_calls: int = 30
        low_calls: int = 14

        bulk_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter: int = 1

        hour_plan: list[tuple[int, int]] = [
            (peak_hour, peak_calls),
            (mid_hour, mid_calls),
            (low_hour, low_calls),
        ]
        for hour_of_day, call_count in hour_plan:
            hour_call_time: datetime = create_utc_call_time(0, hour_of_day)
            for _ in range(call_count):
                bulk_rows.append(
                    (
                        f"avg-h-{row_counter}",
                        rep.id,
                        "+919876543210",
                        hour_call_time,
                        30,
                    )
                )
                row_counter += 1
        create_call_records_bulk(bulk_rows)

        response, data = fetch_team_dashboard(client, "mgr-token-avg-hours")
        assert response.status_code == 200

        thirty_day_dials: list[int] = data["last_30_days"]["calls_by_hour"]["dials"]
        expected_averages: list[int] = [0, 0, 2, 0, 0, 1, 0, 0, 0, 0]
        assert thirty_day_dials == expected_averages
        assert data["last_30_days"]["calls_by_hour"]["best_hour"] == peak_hour


def test_team_dashboard_top_people_max_five_sorted_by_seconds(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager11", role="manager", token="mgr-token-11")
        rep_names_and_seconds: list[tuple[str, int]] = [
            ("rep_a", 600),
            ("rep_b", 500),
            ("rep_c", 400),
            ("rep_d", 300),
            ("rep_e", 200),
            ("rep_f", 100),
        ]
        reps_by_name: dict[str, User] = {}
        call_time: datetime = now_ist().astimezone(timezone.utc)
        call_counter: int = 1
        for rep_name, talk_seconds in rep_names_and_seconds:
            created_rep: User = create_user_fixture(
                name=rep_name, role="salesperson", token=f"token-{rep_name}"
            )
            reps_by_name[rep_name] = created_rep
            create_call_record(
                f"tp-{call_counter}",
                created_rep.id,
                f"+9198765432{call_counter:02d}",
                call_time,
                talk_seconds,
            )
            call_counter += 1

        response, data = fetch_team_dashboard(client, "mgr-token-11")
        expected_status: int = 200
        assert response.status_code == expected_status

        top_people_limit: int = 5
        today_top: list[dict[str, Any]] = data["today"]["top_people"]
        assert len(today_top) == top_people_limit
        expected_seconds_order: list[int] = [600, 500, 400, 300, 200]
        expected_minutes_order: list[float] = [10, 8.33, 6.67, 5, 3.33]
        returned_seconds: list[int] = [person["seconds"] for person in today_top]
        returned_minutes: list[float] = [person["minutes"] for person in today_top]
        assert returned_seconds == expected_seconds_order
        assert returned_minutes == expected_minutes_order
        assert today_top[0]["id"] == reps_by_name["rep_a"].id
        assert today_top[0]["name"] == "rep_a"
        assert "rep_f" not in [person["name"] for person in today_top]

        thirty_day_top: list[dict[str, Any]] = data["last_30_days"]["top_people"]
        assert len(thirty_day_top) == top_people_limit
        expected_thirty_day_names: list[str] = [
            "rep_a",
            "rep_b",
            "rep_c",
            "rep_d",
            "rep_e",
        ]
        returned_thirty_day_names: list[str] = [
            person["name"] for person in thirty_day_top
        ]
        assert returned_thirty_day_names == expected_thirty_day_names

        assert data["yesterday"]["top_people"] == []


def test_team_dashboard_top_people_active_only_with_talk_time(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager12", role="manager", token="mgr-token-12")
        active_rep: User = create_user_fixture(
            name="rep_talk", role="salesperson", token="token-rep-talk"
        )
        silent_rep: User = create_user_fixture(
            name="rep_silent", role="salesperson", token="token-rep-silent"
        )
        deactivated_rep: User = create_user_fixture(
            name="rep_deact_talk",
            role="salesperson",
            is_active=False,
            token="token-rep-deact-talk",
        )

        call_time: datetime = now_ist().astimezone(timezone.utc)
        create_call_record("ta-1", active_rep.id, "+919876543210", call_time, 300)
        create_call_record("ta-2", silent_rep.id, "+919876543211", call_time, 0)
        create_call_record("ta-3", deactivated_rep.id, "+919876543212", call_time, 900)

        response, data = fetch_team_dashboard(client, "mgr-token-12")
        expected_status: int = 200
        assert response.status_code == expected_status

        today_top: list[dict[str, Any]] = data["today"]["top_people"]
        assert len(today_top) == 1
        assert today_top[0]["id"] == active_rep.id
        assert today_top[0]["seconds"] == 300
        assert today_top[0]["minutes"] == 5

        assert data["last_30_days"]["dials"] == 3
        assert data["last_30_days"]["connected"] == 2
        assert data["last_30_days"]["not_connected"] == 1
        assert data["last_30_days"]["seconds"] == 1200
        assert data["last_30_days"]["minutes"] == 20


def test_team_dashboard_excludes_manager_calls_from_team_totals(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        manager: User = create_user_fixture(
            name="manager_caller", role="manager", token="mgr-call-token"
        )
        rep: User = create_user_fixture(
            name="rep_caller", role="salesperson", token="rep-call-token"
        )
        call_time: datetime = now_ist().astimezone(timezone.utc)
        create_call_record("call-mgr-1", manager.id, "+919876543210", call_time, 100)
        create_call_record("call-rep-1", rep.id, "+919876543211", call_time, 50)

        response, data = fetch_team_dashboard(client, "mgr-call-token")
        assert response.status_code == 200
        assert data["today"]["dials"] == 1
        assert data["today"]["seconds"] == 50

        today_top_names: list[str] = [
            person["name"] for person in data["today"]["top_people"]
        ]
        assert today_top_names == ["rep_caller"]
