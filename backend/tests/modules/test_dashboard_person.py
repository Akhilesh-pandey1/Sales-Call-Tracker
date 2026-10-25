from datetime import datetime, timezone
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
    fetch_person_dashboard,
)


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
        response, data = fetch_person_dashboard(client, "owner-token", salesperson.id)
        assert response.status_code == 200
        assert data["name"] == "sales_owner"
        assert data["today"]["dials"] == 0
        assert data["today"]["connected_percent"] is None


def test_person_dashboard_salesperson_access_other_stats_forbidden(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(
            name="sales_one", role="salesperson", token="sales-one-token"
        )
        salesperson_two: User = create_user_fixture(
            name="sales_two", role="salesperson", token="sales-two-token"
        )
        response, data = fetch_person_dashboard(
            client, "sales-one-token", salesperson_two.id
        )
        assert response.status_code == 403
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
        response, data = fetch_person_dashboard(client, "mgr-token-5", salesperson.id)
        assert response.status_code == 200
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
        response, data = fetch_person_dashboard(
            client, "mgr-token-6", deactivated_user.id
        )
        assert response.status_code == 200
        assert data["name"] == "inactive_rep"


def test_person_dashboard_user_not_found(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(name="manager7", role="manager", token="mgr-token-7")
        response, data = fetch_person_dashboard(client, "mgr-token-7", 999999)
        assert response.status_code == 404
        assert data.get("message") == "User not found."


def test_person_dashboard_three_period_stats_and_rounding(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_stats", role="salesperson", token="rep-stats-token"
        )
        today_time = create_utc_call_time(0, 2)
        yesterday_time = create_utc_call_time(1, 22)
        ten_days_ago_time = create_utc_call_time(10, 0)

        create_call_record("call-t-1", rep.id, "+919876543201", today_time, 100)
        create_call_record("call-t-2", rep.id, "+919876543202", today_time, 50)
        create_call_record("call-t-3", rep.id, "+919876543203", today_time, 0)

        create_call_record("call-y-1", rep.id, "+919876543204", yesterday_time, 80)
        create_call_record("call-y-2", rep.id, "+919876543205", yesterday_time, 0)

        create_call_record("call-old-1", rep.id, "+919876543206", ten_days_ago_time, 200)

        response, data = fetch_person_dashboard(client, "rep-stats-token", rep.id)
        assert response.status_code == 200

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


def test_person_dashboard_outgoing_counts_exclude_incoming(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_direction", role="salesperson", token="rep-direction-token"
        )
        call_time = create_utc_call_time(0, 11)

        create_call_record("dir-out-1", rep.id, "+919876543201", call_time, 100)
        create_call_record("dir-out-2", rep.id, "+919876543202", call_time, 0)
        create_call_record(
            "dir-in-1", rep.id, "+919876543203", call_time, 200, direction="incoming"
        )

        response, data = fetch_person_dashboard(client, "rep-direction-token", rep.id)
        assert response.status_code == 200

        today_block: dict[str, Any] = data["today"]
        assert today_block["dials"] == 2
        assert today_block["connected"] == 1
        assert today_block["not_connected"] == 1
        assert today_block["seconds"] == 300
        assert today_block["minutes"] == 5.0
        assert today_block["connected_percent"] == 50

        today_hours: dict[str, Any] = today_block["calls_by_hour"]
        assert today_hours["outgoing"] == [0, 2, 0, 0, 0, 0, 0, 0, 0]
        assert today_hours["incoming"] == [0, 1, 0, 0, 0, 0, 0, 0, 0]
        assert today_hours["best_hour"] == 11

        assert data["last_30_days"]["dials"] == 2
        assert data["last_30_days"]["connected"] == 1
        assert data["last_30_days"]["seconds"] == 300


def test_person_dashboard_talk_totals_on_every_period(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_talk_totals", role="salesperson", token="rep-talk-totals-token"
        )
        today_time = create_utc_call_time(0, 11)
        yesterday_time = create_utc_call_time(1, 11)

        create_call_record("tt-out-1", rep.id, "+919876543201", today_time, 60)
        create_call_record(
            "tt-in-1", rep.id, "+919876543202", today_time, 120, direction="incoming"
        )
        create_call_record(
            "tt-in-2", rep.id, "+919876543203", yesterday_time, 30, direction="incoming"
        )

        response, data = fetch_person_dashboard(
            client, "rep-talk-totals-token", rep.id
        )
        assert response.status_code == 200

        today_block: dict[str, Any] = data["today"]
        assert today_block["dials"] == 1
        assert today_block["connected"] == 1
        assert today_block["not_connected"] == 0
        assert today_block["seconds"] == 180
        assert today_block["minutes"] == 3.0
        assert today_block["connected_percent"] == 100
        assert today_block["talk_totals"] == {
            "outgoing_calls": 1,
            "outgoing_minutes": 1.0,
            "incoming_calls": 1,
            "incoming_minutes": 2.0,
            "outgoing_percent": 33,
            "incoming_percent": 67,
        }

        yesterday_block: dict[str, Any] = data["yesterday"]
        assert yesterday_block["dials"] == 0
        assert yesterday_block["seconds"] == 30
        assert yesterday_block["minutes"] == 0.5
        assert yesterday_block["connected_percent"] is None
        assert yesterday_block["talk_totals"] == {
            "outgoing_calls": 0,
            "outgoing_minutes": 0.0,
            "incoming_calls": 1,
            "incoming_minutes": 0.5,
            "outgoing_percent": 0,
            "incoming_percent": 100,
        }

        thirty_days_block: dict[str, Any] = data["last_30_days"]
        assert thirty_days_block["dials"] == 1
        assert thirty_days_block["seconds"] == 210
        assert thirty_days_block["minutes"] == 3.5
        assert thirty_days_block["talk_totals"] == {
            "outgoing_calls": 1,
            "outgoing_minutes": 1.0,
            "incoming_calls": 2,
            "incoming_minutes": 2.5,
            "outgoing_percent": 29,
            "incoming_percent": 71,
        }

        period_field_names: list[str] = [
            "calls_by_hour", "connected", "connected_percent", "dials",
            "minutes", "not_connected", "seconds", "talk_totals",
        ]
        assert sorted(today_block.keys()) == period_field_names
        assert sorted(thirty_days_block.keys()) == sorted(
            period_field_names + ["active_days", "avg_per_active_day"]
        )


def test_person_dashboard_period_blocks_carry_minutes_and_not_connected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_minutes", role="salesperson", token="rep-minutes-token"
        )
        ist_now = now_ist()

        today_time = ist_now.astimezone(timezone.utc)
        yesterday_time = create_utc_call_time(1, 22)

        create_call_record("pm-t-1", rep.id, "+919876543201", today_time, 100)
        create_call_record("pm-t-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("pm-t-3", rep.id, "+919876543203", today_time, 0)
        create_call_record("pm-y-1", rep.id, "+919876543204", yesterday_time, 45)

        response, data = fetch_person_dashboard(client, "rep-minutes-token", rep.id)
        assert response.status_code == 200

        assert data["today"]["dials"] == 3
        assert data["today"]["connected"] == 2
        assert data["today"]["not_connected"] == 1
        assert data["today"]["seconds"] == 140
        assert data["today"]["minutes"] == 2.33

        assert data["yesterday"]["dials"] == 1
        assert data["yesterday"]["connected"] == 1
        assert data["yesterday"]["not_connected"] == 0
        assert data["yesterday"]["seconds"] == 45
        assert data["yesterday"]["minutes"] == 0.75

        assert data["last_30_days"]["dials"] == 4
        assert data["last_30_days"]["connected"] == 3
        assert data["last_30_days"]["not_connected"] == 1
        assert data["last_30_days"]["seconds"] == 185
        assert data["last_30_days"]["minutes"] == 3.08


def test_person_dashboard_zero_dials_returns_null_percent(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_zero_dials", role="salesperson", token="rep-zero-token"
        )
        response, data = fetch_person_dashboard(client, "rep-zero-token", rep.id)
        assert response.status_code == 200
        assert data["today"]["dials"] == 0
        assert data["today"]["connected_percent"] is None
        assert data["yesterday"]["dials"] == 0
        assert data["yesterday"]["connected_percent"] is None
        assert data["last_30_days"]["dials"] == 0
        assert data["last_30_days"]["connected_percent"] is None
        assert data["top_numbers"] == []


def test_person_dashboard_no_calls_returns_zero_active_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_no_calls", role="salesperson", token="rep-no-calls-token"
        )
        response, data = fetch_person_dashboard(
            client, "rep-no-calls-token", rep.id
        )
        assert response.status_code == 200

        assert data["name"] == "rep_no_calls"
        assert data["last_30_days"]["active_days"] == 0
        assert data["last_30_days"]["dials"] == 0
        assert data["last_30_days"]["connected"] == 0
        assert data["last_30_days"]["seconds"] == 0
        assert data["last_30_days"]["connected_percent"] is None
        assert data["last_30_days"]["avg_per_active_day"] is None
        assert data["last_30_days"]["calls_by_hour"]["hours"] == list(range(10, 19))
        assert data["last_30_days"]["calls_by_hour"]["outgoing"] == [0] * 9
        assert data["last_30_days"]["calls_by_hour"]["incoming"] == [0] * 9
        assert data["last_30_days"]["calls_by_hour"]["best_hour"] is None
        assert data["today"]["dials"] == 0
        assert data["today"]["not_connected"] == 0
        assert data["today"]["minutes"] == 0
        assert data["today"]["calls_by_hour"]["best_hour"] is None
        assert data["today"]["talk_totals"] == {
            "outgoing_calls": 0,
            "outgoing_minutes": 0.0,
            "incoming_calls": 0,
            "incoming_minutes": 0.0,
            "outgoing_percent": 0,
            "incoming_percent": 0,
        }
        assert data["yesterday"]["dials"] == 0
        assert data["top_numbers"] == []


def test_person_dashboard_short_call_shows_decimal_minutes(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_person_short",
            role="salesperson",
            token="rep-person-short-token",
        )

        call_time = now_ist().astimezone(timezone.utc)
        create_call_record("person-short-1", rep.id, "+919876543210", call_time, 20)

        response, data = fetch_person_dashboard(
            client, "rep-person-short-token", rep.id
        )
        assert response.status_code == 200

        assert data["today"]["connected"] == 1
        assert data["today"]["minutes"] == 0.33
        assert data["top_numbers"][0]["minutes"] == 0.33
        assert data["last_30_days"]["avg_per_active_day"]["minutes"] == 0.33


def test_person_dashboard_active_days_count_outgoing_days_only(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_active_out", role="salesperson", token="rep-active-out-token"
        )
        today_time = create_utc_call_time(0, 11)
        ten_days_ago_time = create_utc_call_time(10, 11)

        create_call_record("ao-out-1", rep.id, "+919876543201", today_time, 60)
        create_call_record(
            "ao-in-1", rep.id, "+919876543202", ten_days_ago_time, 30, direction="incoming"
        )
        create_call_record(
            "ao-in-2", rep.id, "+919876543203", ten_days_ago_time, 90, direction="incoming"
        )

        response, data = fetch_person_dashboard(client, "rep-active-out-token", rep.id)
        assert response.status_code == 200

        thirty_days_block: dict[str, Any] = data["last_30_days"]
        assert thirty_days_block["active_days"] == 1
        assert thirty_days_block["dials"] == 1
        assert thirty_days_block["connected"] == 1
        assert thirty_days_block["seconds"] == 180
        assert thirty_days_block["minutes"] == 3.0
        assert thirty_days_block["avg_per_active_day"] == {
            "dials": 1,
            "connected": 1,
            "minutes": 3.0,
        }
        assert "active_days" not in data["today"]
        assert "avg_per_active_day" not in data["today"]
        assert "active_days" not in data["yesterday"]


def test_person_dashboard_incoming_only_period_makes_no_active_day(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_incoming_only", role="salesperson", token="rep-incoming-only-token"
        )
        call_time = create_utc_call_time(0, 11)

        create_call_record(
            "io-in-1", rep.id, "+919876543201", call_time, 30, direction="incoming"
        )
        create_call_record(
            "io-in-2", rep.id, "+919876543202", call_time, 60, direction="incoming"
        )

        response, data = fetch_person_dashboard(
            client, "rep-incoming-only-token", rep.id
        )
        assert response.status_code == 200

        thirty_days_block: dict[str, Any] = data["last_30_days"]
        assert thirty_days_block["active_days"] == 0
        assert thirty_days_block["avg_per_active_day"] is None
        assert thirty_days_block["dials"] == 0
        assert thirty_days_block["connected"] == 0
        assert thirty_days_block["connected_percent"] is None
        assert thirty_days_block["seconds"] == 90
        assert thirty_days_block["minutes"] == 1.5
        assert thirty_days_block["talk_totals"] == {
            "outgoing_calls": 0,
            "outgoing_minutes": 0.0,
            "incoming_calls": 2,
            "incoming_minutes": 1.5,
            "outgoing_percent": 0,
            "incoming_percent": 100,
        }
        assert len(data["top_numbers"]) == 2


def test_person_dashboard_active_days_counts_distinct_ist_days(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_active_days", role="salesperson", token="rep-active-days-token"
        )
        today_time = create_utc_call_time(0, 3)
        ten_days_ago_time = create_utc_call_time(10, 21)

        create_call_record("call-ad-1", rep.id, "+919876543201", today_time, 30)
        create_call_record("call-ad-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("call-ad-3", rep.id, "+919876543203", ten_days_ago_time, 20)

        response, data = fetch_person_dashboard(
            client, "rep-active-days-token", rep.id
        )
        assert response.status_code == 200

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
        oldest_in_window_time = create_utc_call_time(29, 0)
        outside_window_time = create_utc_call_time(30, 0)

        create_call_record(
            "call-win-1", rep.id, "+919876543201", oldest_in_window_time, 30
        )
        create_call_record(
            "call-win-2", rep.id, "+919876543202", outside_window_time, 30
        )

        response, data = fetch_person_dashboard(client, "rep-window-token", rep.id)
        assert response.status_code == 200

        assert data["last_30_days"]["active_days"] == 1
        assert data["last_30_days"]["dials"] == 1


def test_person_dashboard_avg_per_active_day_computed(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_avg_day", role="salesperson", token="rep-avg-day-token"
        )

        today_time = create_utc_call_time(0, 11)
        ten_days_ago_time = create_utc_call_time(10, 11)

        create_call_record("apd-1", rep.id, "+919876543201", today_time, 30)
        create_call_record("apd-2", rep.id, "+919876543202", today_time, 40)
        create_call_record("apd-3", rep.id, "+919876543203", ten_days_ago_time, 0)

        response, data = fetch_person_dashboard(client, "rep-avg-day-token", rep.id)
        assert response.status_code == 200

        assert data["last_30_days"]["active_days"] == 2
        assert data["last_30_days"]["avg_per_active_day"] == {
            "dials": 2,
            "connected": 1,
            "minutes": 0.58,
        }
        assert "avg_per_active_day" not in data["today"]
        assert "avg_per_active_day" not in data["yesterday"]
        assert "active_days" not in data["today"]
        assert "active_days" not in data["yesterday"]


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

        today_afternoon = create_utc_call_time(0, afternoon_hour)
        today_morning = create_utc_call_time(0, morning_hour)
        today_evening = create_utc_call_time(0, evening_hour)
        yesterday_afternoon = create_utc_call_time(1, afternoon_hour)

        create_call_record("ph-1", rep.id, "+919876543201", today_afternoon, 30)
        create_call_record("ph-2", rep.id, "+919876543202", today_morning, 30)
        create_call_record("ph-3", rep.id, "+919876543203", today_evening, 30)
        create_call_record("ph-4", rep.id, "+919876543204", yesterday_afternoon, 30)
        create_call_record(
            "ph-5",
            rep.id,
            "+919876543205",
            create_utc_call_time(0, 11),
            30,
            direction="incoming",
        )
        create_call_record(
            "ph-6",
            rep.id,
            "+919876543205",
            create_utc_call_time(0, 11),
            30,
            direction="incoming",
        )

        response, data = fetch_person_dashboard(client, "rep-hours-p-token", rep.id)
        assert response.status_code == 200

        default_window_hours: list[int] = list(range(10, 19))

        today_block: dict[str, Any] = data["today"]
        assert today_block["dials"] == 3
        assert today_block["seconds"] == 150
        today_hours: dict[str, Any] = today_block["calls_by_hour"]
        assert today_hours["hours"] == default_window_hours
        assert today_hours["outgoing"] == [0, 0, 0, 0, 1, 0, 0, 0, 0]
        assert today_hours["incoming"] == [0, 2, 0, 0, 0, 0, 0, 0, 0]
        assert today_hours["best_hour"] == 11

        yesterday_hours: dict[str, Any] = data["yesterday"]["calls_by_hour"]
        assert yesterday_hours["outgoing"] == [0, 0, 0, 0, 1, 0, 0, 0, 0]
        assert yesterday_hours["incoming"] == [0] * 9
        assert yesterday_hours["best_hour"] == afternoon_hour


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
        inside_late_hour: int = 10
        outside_window_hour: int = 14

        create_call_record(
            "pw-1",
            rep.id,
            "+919876543201",
            create_utc_call_time(0, in_window_hour),
            30,
        )
        create_call_record(
            "pw-2",
            rep.id,
            "+919876543202",
            create_utc_call_time(0, outside_window_hour),
            30,
        )
        create_call_record(
            "pw-3",
            rep.id,
            "+919876543203",
            create_utc_call_time(0, inside_late_hour),
            30,
        )
        create_call_record(
            "pw-4",
            rep.id,
            "+919876543204",
            create_utc_call_time(0, inside_late_hour),
            30,
            direction="incoming",
        )

        response, data = fetch_person_dashboard(
            client, "rep-token-window-p", rep.id
        )
        assert response.status_code == 200

        today_block: dict[str, Any] = data["today"]
        assert today_block["dials"] == 3
        today_hours: dict[str, Any] = today_block["calls_by_hour"]
        assert today_hours["hours"] == [8, 9, 10, 11]
        assert today_hours["outgoing"] == [0, 1, 1, 0]
        assert today_hours["incoming"] == [0, 0, 1, 0]
        assert today_hours["best_hour"] == inside_late_hour


def test_person_dashboard_last_30_days_calls_by_hour_daily_averages(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_avg_hours_p", role="salesperson", token="rep-avg-hours-p-token"
        )

        peak_hour: int = 12
        incoming_hour: int = 13
        mid_hour: int = 15
        low_hour: int = 18
        outgoing_plan: list[tuple[int, int]] = [
            (peak_hour, 60),
            (mid_hour, 30),
            (low_hour, 14),
        ]
        incoming_plan: list[tuple[int, int]] = [(incoming_hour, 45)]

        outgoing_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter: int = 1
        for hour_of_day, call_count in outgoing_plan:
            hour_call_time = create_utc_call_time(0, hour_of_day)
            for _ in range(call_count):
                outgoing_rows.append(
                    (
                        f"avg-p-out-{row_counter}",
                        rep.id,
                        "+919876543210",
                        hour_call_time,
                        30,
                    )
                )
                row_counter += 1
        create_call_records_bulk(outgoing_rows, direction="outgoing")

        incoming_rows: list[tuple[str, int, str, datetime, int]] = []
        row_counter = 1
        for hour_of_day, call_count in incoming_plan:
            hour_call_time = create_utc_call_time(0, hour_of_day)
            for _ in range(call_count):
                incoming_rows.append(
                    (
                        f"avg-p-in-{row_counter}",
                        rep.id,
                        "+919876543211",
                        hour_call_time,
                        30,
                    )
                )
                row_counter += 1
        create_call_records_bulk(incoming_rows, direction="incoming")

        response, data = fetch_person_dashboard(
            client, "rep-avg-hours-p-token", rep.id
        )
        assert response.status_code == 200

        today_hours: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_hours["outgoing"] == [0, 0, 60, 0, 0, 30, 0, 0, 14]
        assert today_hours["incoming"] == [0, 0, 0, 45, 0, 0, 0, 0, 0]
        assert today_hours["best_hour"] == peak_hour

        thirty_day_hours: dict[str, Any] = data["last_30_days"]["calls_by_hour"]
        assert thirty_day_hours["outgoing"] == [0, 0, 2, 0, 0, 1, 0, 0, 0]
        assert thirty_day_hours["incoming"] == [0, 0, 0, 2, 0, 0, 0, 0, 0]
        assert thirty_day_hours["best_hour"] == peak_hour


def test_person_dashboard_end_minute_call_counts_in_last_bucket(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_end_minute_p",
            role="salesperson",
            token="rep-end-minute-p-token",
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

        create_call_record("pem-1", rep.id, "+919876543201", end_minute_call, 30)
        create_call_record(
            "pem-2", rep.id, "+919876543202", call_just_after_window, 30
        )

        response, data = fetch_person_dashboard(
            client, "rep-end-minute-p-token", rep.id
        )
        assert response.status_code == 200

        today_calls_by_hour: dict[str, Any] = data["today"]["calls_by_hour"]
        assert today_calls_by_hour["hours"] == list(range(10, 19))
        today_outgoing: list[int] = today_calls_by_hour["outgoing"]
        assert sum(today_outgoing) == 1
        assert today_outgoing[last_bucket_index] == 1
        assert today_calls_by_hour["best_hour"] == window_end_hour - 1


def test_person_dashboard_top_numbers_rank_by_total_talk(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_top_numbers", role="salesperson", token="rep-top-token"
        )
        call_time = create_utc_call_time(0, 11)

        create_call_record("tn-1a", rep.id, "+919876543211", call_time, 250)
        create_call_record("tn-1b", rep.id, "+919876543211", call_time, 250)
        create_call_record(
            "tn-2a", rep.id, "+919876543212", call_time, 400, direction="incoming"
        )
        create_call_record("tn-3a", rep.id, "+919876543213", call_time, 150)
        create_call_record(
            "tn-3b", rep.id, "+919876543213", call_time, 150, direction="incoming"
        )
        create_call_record("tn-4a", rep.id, "+919876543214", call_time, 200)
        create_call_record("tn-5a", rep.id, "+919876543215", call_time, 100)
        create_call_record(
            "tn-6a", rep.id, "+919876543216", call_time, 50, direction="incoming"
        )
        create_call_record("tn-7a", rep.id, "+919876543217", call_time, 10)

        response, data = fetch_person_dashboard(client, "rep-top-token", rep.id)
        assert response.status_code == 200

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
        assert top_numbers[0]["minutes"] == 8.33
        assert top_numbers[0]["calls"] == 2
        assert top_numbers[1]["seconds"] == 400
        assert top_numbers[1]["minutes"] == 6.67
        assert top_numbers[1]["calls"] == 1
        assert top_numbers[2]["seconds"] == 300
        assert top_numbers[2]["minutes"] == 5.0
        assert top_numbers[2]["calls"] == 2

        assert data["last_30_days"]["dials"] == 6
        assert data["last_30_days"]["seconds"] == 1560


def test_person_dashboard_carries_office_hours_window_and_label(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        salesperson: User = create_user_fixture(
            name="rep_window", role="salesperson", token="rep-window-token"
        )
        response, data = fetch_person_dashboard(
            client, "rep-window-token", salesperson.id
        )
        assert response.status_code == 200
        assert data["office_hours"] == {"start_time": "10:00", "end_time": "19:00"}
        assert data["office_hours_label"] == "10 to 7"


def test_person_dashboard_label_follows_window_saved_earlier(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_window", role="manager", token="mgr-window-token")
        salesperson: User = create_user_fixture(
            name="rep_saved_window", role="salesperson", token="rep-saved-token"
        )
        manager_headers: dict[str, str] = {"Authorization": "Bearer mgr-window-token"}
        saved_window: dict[str, str] = {"start_time": "09:30", "end_time": "18:15"}

        save_response: Response = client.put(
            "/api/settings/office-hours", json=saved_window, headers=manager_headers
        )
        assert save_response.status_code == 200

        response, data = fetch_person_dashboard(
            client, "rep-saved-token", salesperson.id
        )
        assert response.status_code == 200
        assert data["office_hours"] == {"start_time": "09:30", "end_time": "18:15"}
        assert data["office_hours_label"] == "9:30 to 6:15"


def test_person_dashboard_label_uses_twelve_hour_minutes_only(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager_clock", role="manager", token="mgr-clock-token")
        salesperson: User = create_user_fixture(
            name="rep_clock", role="salesperson", token="rep-clock-token"
        )
        manager_headers: dict[str, str] = {"Authorization": "Bearer mgr-clock-token"}
        saved_window: dict[str, str] = {"start_time": "12:45", "end_time": "21:05"}

        save_response: Response = client.put(
            "/api/settings/office-hours", json=saved_window, headers=manager_headers
        )
        assert save_response.status_code == 200

        response, data = fetch_person_dashboard(
            client, "rep-clock-token", salesperson.id
        )
        assert response.status_code == 200
        assert data["office_hours_label"] == "12:45 to 9:05"

        midnight_window: dict[str, str] = {"start_time": "00:30", "end_time": "10:00"}
        midnight_response: Response = client.put(
            "/api/settings/office-hours", json=midnight_window, headers=manager_headers
        )
        assert midnight_response.status_code == 200

        midnight_fetch, midnight_data = fetch_person_dashboard(
            client, "rep-clock-token", salesperson.id
        )
        assert midnight_fetch.status_code == 200
        assert midnight_data["office_hours_label"] == "12:30 to 10"


def test_person_dashboard_fewer_than_five_numbers(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        rep: User = create_user_fixture(
            name="rep_few_numbers", role="salesperson", token="rep-few-token"
        )
        call_time = now_ist().astimezone(timezone.utc)

        create_call_record("c-few-1", rep.id, "+919876543211", call_time, 250)
        create_call_record(
            "c-few-2", rep.id, "+919876543212", call_time, 150, direction="incoming"
        )

        response, data = fetch_person_dashboard(client, "rep-few-token", rep.id)
        assert response.status_code == 200

        top_numbers: list[dict[str, Any]] = data["top_numbers"]
        assert len(top_numbers) == 2
        assert top_numbers[0]["phone_number"] == "+919876543211"
        assert top_numbers[0]["seconds"] == 250
        assert top_numbers[0]["minutes"] == 4.17
        assert top_numbers[0]["calls"] == 1
        assert top_numbers[1]["phone_number"] == "+919876543212"
        assert top_numbers[1]["seconds"] == 150
        assert top_numbers[1]["minutes"] == 2.5
        assert top_numbers[1]["calls"] == 1
