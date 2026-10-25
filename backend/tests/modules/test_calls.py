from datetime import date, datetime, timedelta, timezone
import logging
from typing import Any
import pytest
from zoneinfo import ZoneInfo
from flask import Flask, Response
from flask.testing import FlaskClient
from backend.app.config.base import (
    MAX_CALL_AGE_DAYS,
    MAX_LEAD_ATTEMPTS,
    MAX_SCHEDULE_AHEAD_DAYS,
    RETRY_LOCK_HOURS,
)
from backend.app.core.security import hash_password
from backend.app.core.utils import (
    get_ist_timezone,
    normalize_phone_number,
    now_ist,
    now_utc,
)
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.leads import Lead
from backend.app.modules.users import User
from backend.tests.modules.session_test_helpers import (
    create_session_record,
    fetch_user_session_token,
)


def create_user_fixture(
    name: str = "salesperson1",
    country: str = "IN",
    role: str = "salesperson",
    is_active: bool = True,
    token: str = "test-token-123",
) -> User:
    user: User = User(
        name=name,
        password_hash=hash_password("Password123"),
        role=role,
        country=country,
        is_active=is_active,
    )
    db.session.add(user)
    db.session.commit()
    create_session_record(user_id=user.id, token=token)
    return user


def create_lead_fixture(
    phone_number: str = "+919876543210",
    status: str = "waiting",
    attempt_count: int = 0,
    claimed_by: int | None = None,
    scheduled_by: int | None = None,
) -> Lead:
    current_time: datetime = now_utc()
    lead: Lead = Lead(
        phone_number=phone_number,
        status=status,
        attempt_count=attempt_count,
        claimed_by=claimed_by,
        claimed_until=current_time + timedelta(minutes=10) if claimed_by else None,
        scheduled_by=scheduled_by,
        scheduled_at=current_time + timedelta(days=1) if scheduled_by else None,
    )
    db.session.add(lead)
    db.session.commit()
    return lead


def build_ist_dialed_at(day_offset_days: int, hour: int, minute: int) -> str:
    ist_timezone: ZoneInfo = get_ist_timezone()
    current_ist: datetime = now_ist()
    target_day: date = (current_ist + timedelta(days=day_offset_days)).date()
    ist_datetime: datetime = datetime(
        target_day.year,
        target_day.month,
        target_day.day,
        hour,
        minute,
        tzinfo=ist_timezone,
    )
    return ist_datetime.isoformat()


def build_utc_iso_days_from_now(days_from_now: int) -> str:
    target_time: datetime = now_utc() + timedelta(days=days_from_now)
    return target_time.isoformat()


def test_sync_valid_batch_saved(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-1",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                },
                {
                    "call_id": "call-2",
                    "phone_number": "+919876543211",
                    "dialed_at": build_ist_dialed_at(0, 11, 50),
                    "duration_seconds": 0,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_call_1: Call | None = db.session.get(Call, "call-1")
        saved_call_2: Call | None = db.session.get(Call, "call-2")

        assert saved_call_1 is not None
        assert saved_call_1.user_id == user.id
        assert saved_call_1.phone_number == "+919876543210"
        assert saved_call_1.duration_seconds == 45

        assert saved_call_2 is not None
        assert saved_call_2.user_id == user.id
        assert saved_call_2.phone_number == "+919876543211"
        assert saved_call_2.duration_seconds == 0


def test_sync_old_call_dropped(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}
        current_time: datetime = now_utc()

        old_age_days: int = MAX_CALL_AGE_DAYS + 1
        old_time: datetime = current_time - timedelta(days=old_age_days)

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-old",
                    "phone_number": "9876543210",
                    "dialed_at": old_time.isoformat(),
                    "duration_seconds": 120,
                },
                {
                    "call_id": "call-new",
                    "phone_number": "9876543212",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 30,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        old_call: Call | None = db.session.get(Call, "call-old")
        new_call: Call | None = db.session.get(Call, "call-new")

        assert old_call is None
        assert new_call is not None
        assert new_call.user_id == user.id


def test_sync_window_boundaries_inclusive(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "before-window",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 9, 59),
                    "duration_seconds": 10,
                },
                {
                    "call_id": "at-window-start",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 10, 0),
                    "duration_seconds": 10,
                },
                {
                    "call_id": "before-window-end",
                    "phone_number": "9876543212",
                    "dialed_at": build_ist_dialed_at(0, 18, 59),
                    "duration_seconds": 10,
                },
                {
                    "call_id": "at-window-end",
                    "phone_number": "9876543213",
                    "dialed_at": build_ist_dialed_at(0, 19, 0),
                    "duration_seconds": 10,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "before-window") is None
        assert db.session.get(Call, "at-window-start") is not None
        assert db.session.get(Call, "before-window-end") is not None
        assert db.session.get(Call, "at-window-end") is not None


def test_sync_out_of_window_call_dropped_with_warning(
    app: Flask, client: FlaskClient, caplog: pytest.LogCaptureFixture
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "after-window",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 19, 1),
                    "duration_seconds": 30,
                },
                {
                    "call_id": "inside-window",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 30,
                },
            ]
        }

        services_logger_name: str = "backend.app.modules.calls.services"
        with caplog.at_level(logging.WARNING, logger=services_logger_name):
            response: Response = client.post(
                "/api/calls/sync", json=payload, headers=headers
            )
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "after-window") is None
        assert db.session.get(Call, "inside-window") is not None
        assert "after-window" in caplog.text


def test_sync_office_hours_gate_applies_to_incoming_calls(
    app: Flask, client: FlaskClient, caplog: pytest.LogCaptureFixture
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "incoming-after-window",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 19, 1),
                    "duration_seconds": 120,
                    "direction": "incoming",
                },
                {
                    "call_id": "incoming-inside-window",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 120,
                    "direction": "incoming",
                },
            ]
        }

        services_logger_name: str = "backend.app.modules.calls.services"
        with caplog.at_level(logging.WARNING, logger=services_logger_name):
            response: Response = client.post(
                "/api/calls/sync", json=payload, headers=headers
            )
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "incoming-after-window") is None
        saved_inside_call: Call | None = db.session.get(Call, "incoming-inside-window")
        assert saved_inside_call is not None
        assert saved_inside_call.direction == "incoming"
        assert "incoming-after-window" in caplog.text


def test_sync_judges_call_own_start_time_not_sync_moment(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "yesterday-morning",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(-1, 11, 0),
                    "duration_seconds": 15,
                },
                {
                    "call_id": "yesterday-night",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(-1, 21, 0),
                    "duration_seconds": 15,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "yesterday-morning") is not None
        assert db.session.get(Call, "yesterday-night") is None


def test_sync_uses_updated_window_after_manager_change(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        manager: User = create_user_fixture(
            name="manager1", role="manager", token="manager-token"
        )
        user: User = create_user_fixture()
        manager_headers: dict[str, str] = {
            "Authorization": f"Bearer {fetch_user_session_token(manager.id)}"
        }
        user_headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        new_window: dict[str, str] = {"start_time": "08:00", "end_time": "09:30"}
        update_response: Response = client.put(
            "/api/settings/office-hours", json=new_window, headers=manager_headers
        )
        expected_code: int = 200
        assert update_response.status_code == expected_code

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "inside-new-window",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 8, 30),
                    "duration_seconds": 10,
                },
                {
                    "call_id": "outside-new-window",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 10, 30),
                    "duration_seconds": 10,
                },
            ]
        }

        response: Response = client.post(
            "/api/calls/sync", json=payload, headers=user_headers
        )
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "inside-new-window") is not None
        assert db.session.get(Call, "outside-new-window") is None


def test_sync_malformed_row_skipped_while_valid_saved(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 10,
                },
                {
                    "call_id": "bad-date",
                    "phone_number": "9876543210",
                    "dialed_at": "invalid-datetime-string",
                    "duration_seconds": 10,
                },
                {
                    "call_id": "bad-duration",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": -5,
                },
                "not-a-dict",
                {
                    "call_id": "valid-call",
                    "phone_number": "9876543213",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 60,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_valid: Call | None = db.session.get(Call, "valid-call")
        assert saved_valid is not None
        assert saved_valid.duration_seconds == 60

        assert db.session.get(Call, "bad-date") is None
        assert db.session.get(Call, "bad-duration") is None


def test_sync_leaves_outcome_column_empty_on_every_saved_row(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-without-outcome-field",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                },
                {
                    "call_id": "call-with-stale-outcome-field",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 12, 5),
                    "duration_seconds": 30,
                    "outcome": "connected",
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_rows: list[Call] = Call.query.all()
        expected_saved_count: int = 2
        assert len(saved_rows) == expected_saved_count
        for saved_row in saved_rows:
            assert saved_row.outcome is None


def test_sync_incoming_call_saved_without_touching_lead(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        existing_lead: Lead = create_lead_fixture(
            phone_number="+919876543210",
            status="waiting",
            attempt_count=0,
            claimed_by=user.id,
            scheduled_by=user.id,
        )
        schedule_days_ahead: int = 5

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-incoming-answered",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                    "direction": "incoming",
                    "scheduled_at": build_utc_iso_days_from_now(schedule_days_ahead),
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_call: Call | None = db.session.get(Call, "call-incoming-answered")
        assert saved_call is not None
        assert saved_call.user_id == user.id
        assert saved_call.direction == "incoming"

        refreshed_lead: Lead | None = db.session.get(Lead, existing_lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.attempt_count == 0
        assert refreshed_lead.last_attempted_at is None
        assert refreshed_lead.claimed_by == user.id
        assert refreshed_lead.scheduled_by == user.id
        assert refreshed_lead.scheduled_at is not None


def test_sync_incoming_call_never_creates_lead(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-incoming-unknown-number",
                    "phone_number": "9876500044",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                    "direction": "incoming",
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_call: Call | None = db.session.get(Call, "call-incoming-unknown-number")
        assert saved_call is not None
        assert saved_call.direction == "incoming"

        lead_count: int = Lead.query.filter_by(phone_number="+919876500044").count()
        expected_lead_count: int = 0
        assert lead_count == expected_lead_count


def test_sync_call_without_direction_saves_as_outgoing(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-no-direction-field",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        saved_call: Call | None = db.session.get(Call, "call-no-direction-field")
        assert saved_call is not None
        assert saved_call.direction == "outgoing"


def test_sync_invalid_direction_row_skipped_while_valid_saved(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-bad-direction",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                    "direction": "missed",
                },
                {
                    "call_id": "call-good-direction",
                    "phone_number": "9876543211",
                    "dialed_at": build_ist_dialed_at(0, 12, 5),
                    "duration_seconds": 45,
                    "direction": "outgoing",
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        assert db.session.get(Call, "call-bad-direction") is None
        saved_good_call: Call | None = db.session.get(Call, "call-good-direction")
        assert saved_good_call is not None
        assert saved_good_call.direction == "outgoing"


def test_sync_server_deduplicates_retried_rows(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        batch_one: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "duplicate-call-id",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 15,
                }
            ]
        }

        first_response: Response = client.post(
            "/api/calls/sync", json=batch_one, headers=headers
        )
        assert first_response.status_code == 200

        batch_two: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "duplicate-call-id",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 15,
                },
                {
                    "call_id": "duplicate-call-id",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 15,
                },
                {
                    "call_id": "second-call-id",
                    "phone_number": "9876543214",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 25,
                },
            ]
        }

        second_response: Response = client.post(
            "/api/calls/sync", json=batch_two, headers=headers
        )
        assert second_response.status_code == 200
        second_json: dict[str, Any] = second_response.get_json()
        assert second_json.get("status") is True

        total_calls_count: int = Call.query.count()
        expected_count: int = 2
        assert total_calls_count == expected_count


def test_phone_number_normalization_local_format(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture(country="IN")
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-local",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 10,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        saved_call: Call | None = db.session.get(Call, "call-local")
        assert saved_call is not None
        assert saved_call.phone_number == "+919876543210"


def test_phone_number_normalization_international_format(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture(country="IN")
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-us",
                    "phone_number": "+14155552671",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 20,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        saved_call: Call | None = db.session.get(Call, "call-us")
        assert saved_call is not None
        assert saved_call.phone_number == "+14155552671"


def test_phone_number_normalization_unparseable_stored_raw(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture(country="IN")
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-raw",
                    "phone_number": "invalid-12345",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 5,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        saved_call: Call | None = db.session.get(Call, "call-raw")
        assert saved_call is not None
        assert saved_call.phone_number == "12345"


def test_lead_resolution_connected_call_finishes_lead(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        lead: Lead = create_lead_fixture(
            phone_number="+919876543210",
            status="waiting",
            attempt_count=1,
            claimed_by=user.id,
            scheduled_by=user.id,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-finish",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_lead: Lead | None = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "done"
        assert refreshed_lead.claimed_by is None
        assert refreshed_lead.claimed_until is None
        assert refreshed_lead.scheduled_by is None
        assert refreshed_lead.scheduled_at is None
        assert refreshed_lead.last_attempted_at is not None


def test_lead_resolution_unconnected_call_increments_and_locks(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}
        current_time: datetime = now_utc()

        lead: Lead = create_lead_fixture(
            phone_number="+919876543210",
            status="waiting",
            attempt_count=0,
            claimed_by=user.id,
            scheduled_by=user.id,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-unconnected",
                    "phone_number": "+919876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_lead: Lead | None = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.attempt_count == 1
        assert refreshed_lead.claimed_by is None
        assert refreshed_lead.claimed_until is None
        assert refreshed_lead.scheduled_by is None
        assert refreshed_lead.scheduled_at is None
        assert refreshed_lead.retry_locked_until is not None

        retry_locked_time: datetime = refreshed_lead.retry_locked_until
        if retry_locked_time.tzinfo is None:
            retry_locked_time = retry_locked_time.replace(tzinfo=timezone.utc)

        expected_lock_boundary: datetime = current_time + timedelta(
            hours=RETRY_LOCK_HOURS
        )
        assert retry_locked_time >= expected_lock_boundary - timedelta(
            seconds=5
        )


def test_lead_resolution_stopped_at_attempt_cap(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        starting_attempts: int = MAX_LEAD_ATTEMPTS - 1
        lead: Lead = create_lead_fixture(
            phone_number="+919876543210",
            status="waiting",
            attempt_count=starting_attempts,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-cap",
                    "phone_number": "+919876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_lead: Lead | None = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "stopped"
        assert refreshed_lead.attempt_count == MAX_LEAD_ATTEMPTS


def test_lead_resolution_manual_keypad_call_resolves_lead(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        lead: Lead = create_lead_fixture(
            phone_number="+919876543210",
            status="waiting",
            attempt_count=0,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-manual-keypad",
                    "phone_number": "9876543210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 15,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_lead: Lead | None = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "done"


def test_sync_call_to_new_number_creates_lead_and_marks_it_done(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-new-number-connected",
                    "phone_number": "9876500011",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        created_lead: Lead | None = Lead.query.filter_by(
            phone_number="+919876500011"
        ).first()
        assert created_lead is not None
        assert created_lead.status == "done"
        assert created_lead.attempt_count == 0
        assert created_lead.last_attempted_at is not None


def test_sync_call_to_new_number_burns_attempt_one_when_unconnected(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-new-number-unconnected",
                    "phone_number": "+919876500022",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                }
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        created_lead: Lead | None = Lead.query.filter_by(
            phone_number="+919876500022"
        ).first()
        assert created_lead is not None
        assert created_lead.status == "waiting"
        assert created_lead.attempt_count == 1
        assert created_lead.retry_locked_until is not None
        assert created_lead.last_attempted_at is not None


def test_sync_repeated_unconnected_calls_to_new_number_stop_lead_at_limit(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        limit_call_ids: list[str] = [
            "call-limit-one",
            "call-limit-two",
            "call-limit-three",
        ]
        for limit_call_id in limit_call_ids:
            payload: dict[str, Any] = {
                "calls": [
                    {
                        "call_id": limit_call_id,
                        "phone_number": "9876500033",
                        "dialed_at": build_ist_dialed_at(0, 12, 0),
                        "duration_seconds": 0,
                    }
                ]
            }
            sync_response: Response = client.post(
                "/api/calls/sync", json=payload, headers=headers
            )
            assert sync_response.status_code == 200

        created_lead: Lead | None = Lead.query.filter_by(
            phone_number="+919876500033"
        ).first()
        assert created_lead is not None
        assert created_lead.status == "stopped"
        assert created_lead.attempt_count == MAX_LEAD_ATTEMPTS
        assert created_lead.retry_locked_until is None


def test_sync_second_call_to_existing_lead_number_never_creates_second_lead(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        missed_call_payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-first-miss",
                    "phone_number": "9876500044",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                }
            ]
        }
        first_response: Response = client.post(
            "/api/calls/sync", json=missed_call_payload, headers=headers
        )
        assert first_response.status_code == 200

        connected_call_payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-second-connected",
                    "phone_number": "9876500044",
                    "dialed_at": build_ist_dialed_at(0, 13, 0),
                    "duration_seconds": 30,
                }
            ]
        }
        second_response: Response = client.post(
            "/api/calls/sync", json=connected_call_payload, headers=headers
        )
        assert second_response.status_code == 200

        lead_count: int = Lead.query.filter_by(phone_number="+919876500044").count()
        expected_lead_count: int = 1
        assert lead_count == expected_lead_count

        resolved_lead: Lead | None = Lead.query.filter_by(
            phone_number="+919876500044"
        ).first()
        assert resolved_lead is not None
        assert resolved_lead.status == "done"
        assert resolved_lead.attempt_count == 1


def test_lead_resolution_ignores_already_done_or_stopped_lead_for_unconnected_calls(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        done_lead: Lead = create_lead_fixture(
            phone_number="+919876543211",
            status="done",
            attempt_count=1,
        )
        stopped_lead: Lead = create_lead_fixture(
            phone_number="+919876543212",
            status="stopped",
            attempt_count=3,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-done-unconnected",
                    "phone_number": "+919876543211",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                },
                {
                    "call_id": "call-stopped-unconnected",
                    "phone_number": "+919876543212",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_done: Lead | None = db.session.get(Lead, done_lead.id)
        assert refreshed_done is not None
        assert refreshed_done.status == "done"
        assert refreshed_done.attempt_count == 1
        assert refreshed_done.last_attempted_at is None

        refreshed_stopped: Lead | None = db.session.get(Lead, stopped_lead.id)
        assert refreshed_stopped is not None
        assert refreshed_stopped.status == "stopped"
        assert refreshed_stopped.attempt_count == 3
        assert refreshed_stopped.last_attempted_at is None


def test_sync_scheduled_at_schedules_resolved_lead_and_saves_call(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        matched_lead: Lead = create_lead_fixture(
            phone_number="+919876500100",
            status="waiting",
            attempt_count=0,
        )
        schedule_days_ahead: int = 5

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-schedule-matched",
                    "phone_number": "9876500100",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(schedule_days_ahead),
                },
                {
                    "call_id": "call-schedule-created",
                    "phone_number": "9876500101",
                    "dialed_at": build_ist_dialed_at(0, 12, 5),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(schedule_days_ahead),
                },
            ]
        }

        response: Response = client.post("/api/calls/sync", json=payload, headers=headers)
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_matched_call: Call | None = db.session.get(Call, "call-schedule-matched")
        saved_created_call: Call | None = db.session.get(Call, "call-schedule-created")
        assert saved_matched_call is not None
        assert saved_created_call is not None

        refreshed_matched: Lead | None = db.session.get(Lead, matched_lead.id)
        assert refreshed_matched is not None
        assert refreshed_matched.status == "waiting"
        assert refreshed_matched.attempt_count == 1
        assert refreshed_matched.scheduled_by == user.id

        matched_scheduled_at: datetime = refreshed_matched.scheduled_at
        if matched_scheduled_at.tzinfo is None:
            matched_scheduled_at = matched_scheduled_at.replace(tzinfo=timezone.utc)
        expected_scheduled_at: datetime = now_utc() + timedelta(
            days=schedule_days_ahead
        )
        schedule_tolerance_seconds: float = 5
        assert abs(
            (matched_scheduled_at - expected_scheduled_at).total_seconds()
        ) < schedule_tolerance_seconds

        created_lead: Lead | None = Lead.query.filter_by(
            phone_number="+919876500101"
        ).first()
        assert created_lead is not None
        assert created_lead.status == "waiting"
        assert created_lead.attempt_count == 1
        assert created_lead.scheduled_by == user.id
        assert created_lead.scheduled_at is not None


def test_sync_scheduled_at_books_lead_even_when_call_connects(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user = create_user_fixture()
        headers = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        lead = create_lead_fixture(
            phone_number="+919876500200",
            status="waiting",
            attempt_count=0,
        )
        schedule_days_ahead = 5

        payload = {
            "calls": [
                {
                    "call_id": "call-connect-with-schedule",
                    "phone_number": "9876500200",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 45,
                    "scheduled_at": build_utc_iso_days_from_now(schedule_days_ahead),
                }
            ]
        }

        response = client.post(
            "/api/calls/sync", json=payload, headers=headers
        )
        status_code = response.status_code
        response_json = response.get_json()

        expected_code = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_call = db.session.get(Call, "call-connect-with-schedule")
        assert saved_call is not None

        refreshed_lead = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.scheduled_by == user.id

        booked_scheduled_at = refreshed_lead.scheduled_at
        if booked_scheduled_at.tzinfo is None:
            booked_scheduled_at = booked_scheduled_at.replace(tzinfo=timezone.utc)
        expected_scheduled_at = now_utc() + timedelta(
            days=schedule_days_ahead
        )
        schedule_tolerance_seconds = 5
        assert abs(
            (booked_scheduled_at - expected_scheduled_at).total_seconds()
        ) < schedule_tolerance_seconds


def test_sync_schedule_lifts_done_or_stopped_lead_back_to_waiting(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user = create_user_fixture()
        headers = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        done_lead = create_lead_fixture(
            phone_number="+919876500210",
            status="done",
            attempt_count=1,
        )
        stopped_lead = create_lead_fixture(
            phone_number="+919876500211",
            status="stopped",
            attempt_count=3,
        )

        payload = {
            "calls": [
                {
                    "call_id": "call-lift-done",
                    "phone_number": "9876500210",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(3),
                },
                {
                    "call_id": "call-lift-stopped",
                    "phone_number": "9876500211",
                    "dialed_at": build_ist_dialed_at(0, 12, 5),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(3),
                },
            ]
        }

        response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200

        refreshed_done = db.session.get(Lead, done_lead.id)
        assert refreshed_done is not None
        assert refreshed_done.status == "waiting"
        assert refreshed_done.scheduled_by == user.id
        assert refreshed_done.scheduled_at is not None
        assert refreshed_done.attempt_count == 1

        refreshed_stopped = db.session.get(Lead, stopped_lead.id)
        assert refreshed_stopped is not None
        assert refreshed_stopped.status == "waiting"
        assert refreshed_stopped.scheduled_by == user.id
        assert refreshed_stopped.scheduled_at is not None
        assert refreshed_stopped.attempt_count == 3


def test_sync_schedule_by_non_owner_is_refused_and_owner_keeps_booking(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        owner_user = create_user_fixture(name="booking-owner", token="owner-token")
        other_user = create_user_fixture(name="other-caller", token="other-token")
        other_headers = {"Authorization": f"Bearer {fetch_user_session_token(other_user.id)}"}

        booked_days_ahead = 1
        lead = create_lead_fixture(
            phone_number="+919876500220",
            status="waiting",
            attempt_count=0,
            scheduled_by=owner_user.id,
        )

        payload = {
            "calls": [
                {
                    "call_id": "call-refused-schedule",
                    "phone_number": "9876500220",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(4),
                }
            ]
        }

        response = client.post("/api/calls/sync", json=payload, headers=other_headers)
        status_code = response.status_code
        response_json = response.get_json()

        expected_code = 200
        assert status_code == expected_code
        assert response_json.get("status") is True
        assert response_json.get("schedule_refused_call_ids") == [
            "call-refused-schedule"
        ]

        saved_call = db.session.get(Call, "call-refused-schedule")
        assert saved_call is not None
        assert saved_call.user_id == other_user.id

        refreshed_lead = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.scheduled_by == owner_user.id
        assert refreshed_lead.attempt_count == 1
        assert refreshed_lead.claimed_by is None

        owner_scheduled_at = refreshed_lead.scheduled_at
        if owner_scheduled_at.tzinfo is None:
            owner_scheduled_at = owner_scheduled_at.replace(tzinfo=timezone.utc)
        expected_owner_time = now_utc() + timedelta(days=booked_days_ahead)
        schedule_tolerance_seconds = 5
        assert (
            abs(
                (owner_scheduled_at - expected_owner_time).total_seconds()
            )
            < schedule_tolerance_seconds
        )


def test_sync_call_that_stops_a_booked_lead_frees_the_booking(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        owner_user = create_user_fixture(name="stop-owner", token="stop-owner-token")
        other_user = create_user_fixture(name="stop-caller", token="stop-caller-token")
        other_headers = {"Authorization": f"Bearer {fetch_user_session_token(other_user.id)}"}

        attempts_before_final: int = MAX_LEAD_ATTEMPTS - 1
        lead = create_lead_fixture(
            phone_number="+919876500250",
            status="waiting",
            attempt_count=attempts_before_final,
            scheduled_by=owner_user.id,
        )

        payload = {
            "calls": [
                {
                    "call_id": "call-stop-booked",
                    "phone_number": "9876500250",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(4),
                }
            ]
        }

        response = client.post("/api/calls/sync", json=payload, headers=other_headers)
        status_code = response.status_code
        response_json = response.get_json()

        expected_code = 200
        assert status_code == expected_code
        assert response_json.get("status") is True
        assert response_json.get("schedule_refused_call_ids") == []

        saved_call = db.session.get(Call, "call-stop-booked")
        assert saved_call is not None
        assert saved_call.user_id == other_user.id

        refreshed_lead = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.attempt_count == MAX_LEAD_ATTEMPTS
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.scheduled_by == other_user.id
        assert refreshed_lead.scheduled_at is not None
        assert refreshed_lead.retry_locked_until is None


def test_sync_owner_rebooks_own_lead_and_new_time_replaces_old(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        owner_user = create_user_fixture(name="rebooking-owner", token="rebook-token")
        owner_headers = {"Authorization": f"Bearer {fetch_user_session_token(owner_user.id)}"}

        lead = create_lead_fixture(
            phone_number="+919876500230",
            status="waiting",
            attempt_count=0,
            scheduled_by=owner_user.id,
        )

        new_schedule_days_ahead = 5
        payload = {
            "calls": [
                {
                    "call_id": "call-owner-rebook",
                    "phone_number": "9876500230",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(
                        new_schedule_days_ahead
                    ),
                }
            ]
        }

        response = client.post("/api/calls/sync", json=payload, headers=owner_headers)
        status_code = response.status_code
        response_json = response.get_json()

        expected_code = 200
        assert status_code == expected_code
        assert response_json.get("status") is True
        assert response_json.get("schedule_refused_call_ids") == []

        saved_call = db.session.get(Call, "call-owner-rebook")
        assert saved_call is not None
        assert saved_call.user_id == owner_user.id

        refreshed_lead = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.scheduled_by == owner_user.id
        assert refreshed_lead.attempt_count == 1
        assert refreshed_lead.retry_locked_until is None
        assert refreshed_lead.claimed_by is None

        new_scheduled_at = refreshed_lead.scheduled_at
        if new_scheduled_at.tzinfo is None:
            new_scheduled_at = new_scheduled_at.replace(tzinfo=timezone.utc)
        expected_new_time = now_utc() + timedelta(days=new_schedule_days_ahead)
        schedule_tolerance_seconds = 5
        assert (
            abs(
                (new_scheduled_at - expected_new_time).total_seconds()
            )
            < schedule_tolerance_seconds
        )


def test_sync_success_returns_empty_refused_call_ids(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        user = create_user_fixture()
        headers = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        payload = {
            "calls": [
                {
                    "call_id": "call-plain-success",
                    "phone_number": "9876500240",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 10,
                }
            ]
        }

        response = client.post("/api/calls/sync", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.get_json() == {
            "status": True,
            "schedule_refused_call_ids": [],
        }


def test_sync_past_or_beyond_horizon_scheduled_at_skipped_and_calls_saved(
    app: Flask, client: FlaskClient, caplog: pytest.LogCaptureFixture
) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        lead: Lead = create_lead_fixture(
            phone_number="+919876500300",
            status="waiting",
            attempt_count=0,
        )

        payload: dict[str, Any] = {
            "calls": [
                {
                    "call_id": "call-past-schedule",
                    "phone_number": "9876500300",
                    "dialed_at": build_ist_dialed_at(0, 12, 0),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(-1),
                },
                {
                    "call_id": "call-beyond-horizon-schedule",
                    "phone_number": "9876500300",
                    "dialed_at": build_ist_dialed_at(0, 12, 5),
                    "duration_seconds": 0,
                    "scheduled_at": build_utc_iso_days_from_now(
                        MAX_SCHEDULE_AHEAD_DAYS + 1
                    ),
                },
            ]
        }

        leads_logger_name: str = "backend.app.modules.leads.services"
        with caplog.at_level(logging.WARNING, logger=leads_logger_name):
            response: Response = client.post(
                "/api/calls/sync", json=payload, headers=headers
            )
        status_code: int = response.status_code
        response_json: dict[str, Any] = response.get_json()

        expected_code: int = 200
        assert status_code == expected_code
        assert response_json.get("status") is True

        saved_past_call: Call | None = db.session.get(Call, "call-past-schedule")
        saved_beyond_call: Call | None = db.session.get(
            Call, "call-beyond-horizon-schedule"
        )
        assert saved_past_call is not None
        assert saved_beyond_call is not None

        refreshed_lead: Lead | None = db.session.get(Lead, lead.id)
        assert refreshed_lead is not None
        assert refreshed_lead.status == "waiting"
        assert refreshed_lead.attempt_count == 2
        assert refreshed_lead.scheduled_by is None
        assert refreshed_lead.scheduled_at is None
        assert "9876500300" in caplog.text


def test_sync_requires_authentication(client: FlaskClient) -> None:
    response: Response = client.post("/api/calls/sync", json={"calls": []})
    expected_unauthorized: int = 401
    assert response.status_code == expected_unauthorized
    response_json: dict[str, Any] = response.get_json()
    assert response_json.get("message") == "Invalid or expired token."


def test_sync_refuses_deactivated_user(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = create_user_fixture(is_active=False)
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        response: Response = client.post(
            "/api/calls/sync", json={"calls": []}, headers=headers
        )
        expected_forbidden: int = 403
        assert response.status_code == expected_forbidden
        response_json: dict[str, Any] = response.get_json()
        assert (
            response_json.get("message")
            == "Your account is not active. Please contact your manager."
        )


def test_sync_missing_calls_payload(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = create_user_fixture()
        headers: dict[str, str] = {"Authorization": f"Bearer {fetch_user_session_token(user.id)}"}

        response: Response = client.post(
            "/api/calls/sync", json={}, headers=headers
        )
        expected_bad_request: int = 400
        assert response.status_code == expected_bad_request
        response_json: dict[str, Any] = response.get_json()
        assert response_json.get("message") == "A list of calls is required."
