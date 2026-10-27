from datetime import datetime, timedelta, timezone
from typing import Any
from flask import Flask, Response
from flask.testing import FlaskClient
from backend.app.core.utils import now_ist
from backend.app.modules.users import User
from backend.tests.modules.dashboard_test_helpers import (
    create_call_record,
    create_call_records_bulk,
    create_utc_call_time,
    create_utc_call_time_at_minute,
    create_user_fixture,
    fetch_team_dashboard,
    fetch_team_people,
)


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
        create_call_record(
            "pr-6", calling_rep.id, "+919876543206", today_time, 60, "incoming"
        )

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
        assert caller_row["today"]["minutes"] == 2.67
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
        create_call_record("pb-3", rep.id, "+919876543212", today_time, 45, "incoming")
        create_call_record("pb-4", rep.id, "+919876543213", yesterday_time, 45)

        response, data = fetch_team_people(client, "mgr-block-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        expected_period_keys: set[str] = {"dials", "connected", "minutes"}
        rep_row: dict[str, Any] = data[0]
        today_block: dict[str, Any] = rep_row["today"]
        yesterday_block: dict[str, Any] = rep_row["yesterday"]

        assert set(today_block.keys()) == expected_period_keys
        assert set(yesterday_block.keys()) == expected_period_keys

        expected_today_minutes: float = 4.58
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


def test_team_people_rows_sorted_by_today_minutes_highest_first(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="people_mgr_sort", role="manager", token="mgr-sort-token"
        )
        long_call_rep: User = create_user_fixture(
            name="rep_sort_long_call", role="salesperson", token="rep-sort-long-call-token"
        )
        short_calls_rep: User = create_user_fixture(
            name="rep_sort_short_calls", role="salesperson", token="rep-sort-short-calls-token"
        )
        quiet_rep_one: User = create_user_fixture(
            name="rep_sort_quiet_one", role="salesperson", token="rep-sort-quiet-one-token"
        )
        quiet_rep_two: User = create_user_fixture(
            name="rep_sort_quiet_two", role="salesperson", token="rep-sort-quiet-two-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        create_call_record("ps-1", long_call_rep.id, "+919876543210", today_time, 900)
        create_call_record("ps-2", short_calls_rep.id, "+919876543211", today_time, 30)
        create_call_record("ps-3", short_calls_rep.id, "+919876543212", today_time, 30)
        create_call_record("ps-4", short_calls_rep.id, "+919876543213", today_time, 30)
        create_call_record("ps-5", short_calls_rep.id, "+919876543214", today_time, 30)
        create_call_record("ps-6", short_calls_rep.id, "+919876543215", today_time, 30)

        response, data = fetch_team_people(client, "mgr-sort-token")
        expected_status: int = 200
        assert response.status_code == expected_status

        expected_user_order: list[int] = [
            long_call_rep.id,
            short_calls_rep.id,
            quiet_rep_one.id,
            quiet_rep_two.id,
        ]
        returned_user_order: list[int] = [row["user_id"] for row in data]
        assert returned_user_order == expected_user_order

        expected_minutes_order: list[float] = [15.0, 2.5, 0, 0]
        returned_minutes_order: list[float] = [row["today"]["minutes"] for row in data]
        assert returned_minutes_order == expected_minutes_order


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

        default_window_hours: list[int] = list(range(10, 19))

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
            assert period["calls_by_hour"]["outgoing"] == [0] * 9
            assert period["calls_by_hour"]["incoming"] == [0] * 9
            assert period["calls_by_hour"]["best_hour"] is None
            assert period["talk_totals"] == {
                "outgoing_calls": 0,
                "outgoing_minutes": 0,
                "incoming_calls": 0,
                "incoming_minutes": 0,
                "outgoing_percent": 0,
                "incoming_percent": 0,
            }
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


def test_team_dashboard_incoming_calls_never_enter_dials_or_connected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_dir", role="manager", token="mgr-token-dir")
        rep: User = create_user_fixture(
            name="rep_dir", role="salesperson", token="rep-dir-token"
        )
        create_user_fixture(
            name="rep_dir_silent", role="salesperson", token="rep-dir-silent-token"
        )
        create_user_fixture(
            name="rep_dir_third", role="salesperson", token="rep-dir-third-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        yesterday_time: datetime = create_utc_call_time(1, 11)

        create_call_record("dir-t-1", rep.id, "+919876543201", today_time, 120)
        create_call_record("dir-t-2", rep.id, "+919876543202", today_time, 0)
        create_call_record("dir-t-3", rep.id, "+919876543203", today_time, 90, "incoming")
        create_call_record("dir-t-4", rep.id, "+919876543204", today_time, 30, "incoming")
        create_call_record(
            "dir-y-1", rep.id, "+919876543205", yesterday_time, 90, "incoming"
        )

        response, data = fetch_team_dashboard(client, "mgr-token-dir")
        assert response.status_code == 200

        today: dict[str, Any] = data["today"]
        assert today["dials"] == 2
        assert today["connected"] == 1
        assert today["not_connected"] == 1
        assert today["seconds"] == 240
        assert today["minutes"] == 4
        assert today["connected_percent"] == 50
        assert today["avg_per_person_per_day"] == {
            "dials": 1,
            "connected": 0,
            "not_connected": 0,
            "minutes": 1.33,
        }
        assert today["vs_yesterday"] == {
            "dials": 2,
            "connected": 1,
            "not_connected": 1,
            "minutes": 2.5,
        }

        today_top: list[dict[str, Any]] = today["top_people"]
        assert len(today_top) == 1
        assert today_top[0]["id"] == rep.id
        assert today_top[0]["seconds"] == 240
        assert today_top[0]["minutes"] == 4

        yesterday: dict[str, Any] = data["yesterday"]
        assert yesterday["dials"] == 0
        assert yesterday["connected"] == 0
        assert yesterday["not_connected"] == 0
        assert yesterday["seconds"] == 90
        assert yesterday["minutes"] == 1.5
        assert yesterday["connected_percent"] is None

        thirty_days: dict[str, Any] = data["last_30_days"]
        assert thirty_days["dials"] == 2
        assert thirty_days["connected"] == 1
        assert thirty_days["seconds"] == 330
        assert thirty_days["minutes"] == 5.5


def test_team_dashboard_talk_totals_split_on_every_period(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_talk", role="manager", token="mgr-token-talk")
        rep: User = create_user_fixture(
            name="rep_talk", role="salesperson", token="rep-talk-token"
        )

        today_time: datetime = create_utc_call_time(0, 11)
        yesterday_time: datetime = create_utc_call_time(1, 11)

        create_call_record("talk-t-1", rep.id, "+919876543201", today_time, 300)
        create_call_record("talk-t-2", rep.id, "+919876543202", today_time, 100, "incoming")
        create_call_record("talk-y-1", rep.id, "+919876543203", yesterday_time, 120)
        create_call_record(
            "talk-y-2", rep.id, "+919876543204", yesterday_time, 60, "incoming"
        )

        response, data = fetch_team_dashboard(client, "mgr-token-talk")
        assert response.status_code == 200

        assert data["today"]["talk_totals"] == {
            "outgoing_calls": 1,
            "outgoing_minutes": 5,
            "incoming_calls": 1,
            "incoming_minutes": 1.67,
            "outgoing_percent": 75,
            "incoming_percent": 25,
        }
        assert data["yesterday"]["talk_totals"] == {
            "outgoing_calls": 1,
            "outgoing_minutes": 2,
            "incoming_calls": 1,
            "incoming_minutes": 1,
            "outgoing_percent": 67,
            "incoming_percent": 33,
        }
        assert data["last_30_days"]["talk_totals"] == {
            "outgoing_calls": 2,
            "outgoing_minutes": 7,
            "incoming_calls": 2,
            "incoming_minutes": 2.67,
            "outgoing_percent": 72,
            "incoming_percent": 28,
        }


def test_team_dashboard_top_people_rank_by_total_talk_seconds(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_rank", role="manager", token="mgr-token-rank")
        outgoing_only_rep: User = create_user_fixture(
            name="rep_rank_out", role="salesperson", token="rep-rank-out-token"
        )
        mixed_rep: User = create_user_fixture(
            name="rep_rank_mixed", role="salesperson", token="rep-rank-mixed-token"
        )

        call_time: datetime = create_utc_call_time(0, 11)
        create_call_record(
            "rank-1", outgoing_only_rep.id, "+919876543210", call_time, 100
        )
        create_call_record("rank-2", mixed_rep.id, "+919876543211", call_time, 60)
        create_call_record(
            "rank-3", mixed_rep.id, "+919876543212", call_time, 80, "incoming"
        )

        response, data = fetch_team_dashboard(client, "mgr-token-rank")
        assert response.status_code == 200

        today_top: list[dict[str, Any]] = data["today"]["top_people"]
        expected_ranked_ids: list[int] = [mixed_rep.id, outgoing_only_rep.id]
        returned_ranked_ids: list[int] = [person["id"] for person in today_top]
        assert returned_ranked_ids == expected_ranked_ids
        assert today_top[0]["seconds"] == 140
        assert today_top[0]["minutes"] == 2.33
        assert today_top[1]["seconds"] == 100


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
        assert today_hours == list(range(10, 19))

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        today_outgoing: list[int] = today_calls_by_hour["outgoing"]
        assert len(today_outgoing) == 9
        assert sum(today_outgoing) == 1
        assert today_outgoing[afternoon_hour - 10] == 1
        assert today_calls_by_hour["incoming"] == [0] * 9
        assert today_calls_by_hour["best_hour"] == afternoon_hour

        yesterday_calls_by_hour: dict[str, Any] = data["yesterday"]["calls_by_hour"]
        yesterday_outgoing: list[int] = yesterday_calls_by_hour["outgoing"]
        assert sum(yesterday_outgoing) == 1
        assert yesterday_outgoing[afternoon_hour - 10] == 1
        assert yesterday_calls_by_hour["best_hour"] == afternoon_hour


def test_team_dashboard_end_minute_call_counts_in_last_bucket(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_end_minute", role="manager", token="mgr-token-end-minute"
        )
        rep: User = create_user_fixture(
            name="rep_end_minute", role="salesperson", token="rep-end-minute-token"
        )

        window_end_hour: int = 19
        end_minute_of_hour: int = 0
        minute_after_window: int = 1
        last_bucket_index: int = 8

        end_minute_call: datetime = create_utc_call_time_at_minute(
            0, window_end_hour, end_minute_of_hour
        )
        call_just_after_window: datetime = create_utc_call_time_at_minute(
            0, window_end_hour, minute_after_window
        )

        create_call_record("end-min-1", rep.id, "+919876543210", end_minute_call, 30)
        create_call_record(
            "end-min-2", rep.id, "+919876543211", call_just_after_window, 30
        )

        response, data = fetch_team_dashboard(client, "mgr-token-end-minute")
        assert response.status_code == 200

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == list(range(10, 19))
        today_outgoing: list[int] = today_calls_by_hour["outgoing"]
        assert sum(today_outgoing) == 1
        assert today_outgoing[last_bucket_index] == 1
        assert today_calls_by_hour["best_hour"] == window_end_hour - 1


def test_team_dashboard_minutes_window_keeps_last_hour_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager_minutes", role="manager", token="mgr-token-minutes"
        )
        rep: User = create_user_fixture(
            name="rep_minutes", role="salesperson", token="rep-minutes-token"
        )

        put_headers: dict[str, str] = {"Authorization": "Bearer mgr-token-minutes"}
        put_response: Response = client.put(
            "/api/settings/office-hours",
            json={"start_time": "09:30", "end_time": "18:15"},
            headers=put_headers,
        )
        assert put_response.status_code == 200

        before_window_hour: int = 9
        minute_before_window: int = 15
        last_window_hour: int = 18
        minute_in_last_hour: int = 5
        end_minute_of_hour: int = 15
        last_bucket_index: int = 9

        call_before_window: datetime = create_utc_call_time_at_minute(
            0, before_window_hour, minute_before_window
        )
        call_in_last_hour: datetime = create_utc_call_time_at_minute(
            0, last_window_hour, minute_in_last_hour
        )
        call_at_end_minute: datetime = create_utc_call_time_at_minute(
            0, last_window_hour, end_minute_of_hour
        )

        create_call_record("mw-1", rep.id, "+919876543210", call_before_window, 30)
        create_call_record("mw-2", rep.id, "+919876543211", call_in_last_hour, 30)
        create_call_record("mw-3", rep.id, "+919876543212", call_at_end_minute, 30)

        response, data = fetch_team_dashboard(client, "mgr-token-minutes")
        assert response.status_code == 200

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == list(range(9, 19))
        today_outgoing: list[int] = today_calls_by_hour["outgoing"]
        assert sum(today_outgoing) == 2
        assert today_outgoing[last_bucket_index] == 2


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
        assert today_calls_by_hour["hours"] == [8, 9, 10, 11]
        assert today_calls_by_hour["outgoing"] == [0, 1, 0, 0]
        assert today_calls_by_hour["incoming"] == [0] * 4
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

        thirty_day_calls_by_hour: dict[str, Any] = data["last_30_days"]["calls_by_hour"]
        assert thirty_day_calls_by_hour["outgoing"] == [0] * 9
        assert thirty_day_calls_by_hour["incoming"] == [0] * 9

        thirty_day_top: list[dict[str, Any]] = data["last_30_days"]["top_people"]
        assert len(thirty_day_top) == 1
        assert thirty_day_top[0]["id"] == active_rep.id
        assert thirty_day_top[0]["seconds"] == 380
        assert thirty_day_top[0]["minutes"] == 6.33


def test_team_dashboard_last_30_days_hourly_counts_are_daily_averages(
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

        peak_outgoing_calls: int = 60
        mid_outgoing_calls: int = 30
        mid_incoming_calls: int = 29

        outgoing_rows: list[tuple[str, int, str, datetime, int]] = []
        incoming_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter: int = 1

        peak_call_time: datetime = create_utc_call_time(0, peak_hour)
        for _ in range(peak_outgoing_calls):
            outgoing_rows.append(
                (
                    f"avg-h-{row_counter}",
                    rep.id,
                    "+919876543210",
                    peak_call_time,
                    30,
                )
            )
            row_counter += 1

        mid_call_time: datetime = create_utc_call_time(0, mid_hour)
        for _ in range(mid_outgoing_calls):
            outgoing_rows.append(
                (
                    f"avg-h-{row_counter}",
                    rep.id,
                    "+919876543211",
                    mid_call_time,
                    30,
                )
            )
            row_counter += 1
        for _ in range(mid_incoming_calls):
            incoming_rows.append(
                (
                    f"avg-h-{row_counter}",
                    rep.id,
                    "+919876543212",
                    mid_call_time,
                    30,
                )
            )
            row_counter += 1

        create_call_records_bulk(outgoing_rows)
        create_call_records_bulk(incoming_rows, "incoming")

        response, data = fetch_team_dashboard(client, "mgr-token-avg-hours")
        assert response.status_code == 200

        thirty_day_calls_by_hour: dict[str, Any] = data["last_30_days"]["calls_by_hour"]
        expected_outgoing_averages: list[int] = [0, 0, 2, 0, 0, 1, 0, 0, 0]
        expected_incoming_averages: list[int] = [0, 0, 0, 0, 0, 1, 0, 0, 0]
        assert thirty_day_calls_by_hour["outgoing"] == expected_outgoing_averages
        assert thirty_day_calls_by_hour["incoming"] == expected_incoming_averages
        assert thirty_day_calls_by_hour["best_hour"] == peak_hour


def test_team_dashboard_calls_by_hour_split_arrays_and_best_hour_by_total(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_split", role="manager", token="mgr-token-split")
        rep: User = create_user_fixture(
            name="rep_split", role="salesperson", token="rep-split-token"
        )

        outgoing_only_hour: int = 12
        mixed_hour: int = 15

        outgoing_only_time: datetime = create_utc_call_time(0, outgoing_only_hour)
        mixed_time: datetime = create_utc_call_time(0, mixed_hour)

        create_call_record("sp-1", rep.id, "+919876543210", outgoing_only_time, 300)
        create_call_record("sp-2", rep.id, "+919876543211", outgoing_only_time, 300)
        create_call_record("sp-3", rep.id, "+919876543212", mixed_time, 300)
        create_call_record("sp-4", rep.id, "+919876543213", mixed_time, 60, "incoming")
        create_call_record("sp-5", rep.id, "+919876543214", mixed_time, 60, "incoming")
        create_call_record("sp-6", rep.id, "+919876543215", mixed_time, 60, "incoming")

        response, data = fetch_team_dashboard(client, "mgr-token-split")
        assert response.status_code == 200

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == list(range(10, 19))
        expected_outgoing: list[int] = [0, 0, 2, 0, 0, 1, 0, 0, 0]
        expected_incoming: list[int] = [0, 0, 0, 0, 0, 3, 0, 0, 0]
        assert today_calls_by_hour["outgoing"] == expected_outgoing
        assert today_calls_by_hour["incoming"] == expected_incoming
        assert today_calls_by_hour["best_hour"] == mixed_hour


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
