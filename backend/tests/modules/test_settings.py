from typing import Any
from flask import Flask, Response
from flask.testing import FlaskClient
from backend.app.core.security import hash_password
from backend.app.extensions import db
from backend.app.modules.users import User
from backend.tests.modules.session_test_helpers import create_session_record


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
    )
    db.session.add(user)
    db.session.commit()
    create_session_record(user_id=user.id, token=token)
    return user


def test_get_office_hours_fresh_database_returns_default_window(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="manager-token")
        headers: dict[str, str] = {"Authorization": "Bearer manager-token"}
        response: Response = client.get("/api/settings/office-hours", headers=headers)
        expected_status: int = 200
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json == {"start_time": "10:00", "end_time": "19:00"}


def test_put_office_hours_saves_window_for_next_read(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="manager-token")
        headers: dict[str, str] = {"Authorization": "Bearer manager-token"}
        update_payload: dict[str, str] = {"start_time": "09:30", "end_time": "18:00"}

        response: Response = client.put(
            "/api/settings/office-hours", json=update_payload, headers=headers
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        assert response.get_json() == {"status": True}

        read_back: Response = client.get("/api/settings/office-hours", headers=headers)
        assert read_back.get_json() == {"start_time": "09:30", "end_time": "18:00"}


def test_put_office_hours_end_not_after_start_refused(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="manager-token")
        headers: dict[str, str] = {"Authorization": "Bearer manager-token"}
        equal_times: dict[str, str] = {"start_time": "10:00", "end_time": "10:00"}
        end_before_start: dict[str, str] = {"start_time": "18:00", "end_time": "09:30"}

        equal_response: Response = client.put(
            "/api/settings/office-hours", json=equal_times, headers=headers
        )
        expected_status: int = 400
        assert equal_response.status_code == expected_status
        assert (
            equal_response.get_json()["message"] == "End time must be after start time."
        )

        before_response: Response = client.put(
            "/api/settings/office-hours", json=end_before_start, headers=headers
        )
        assert before_response.status_code == expected_status
        assert (
            before_response.get_json()["message"] == "End time must be after start time."
        )


def test_put_office_hours_malformed_body_refused(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="manager-token")
        headers: dict[str, str] = {"Authorization": "Bearer manager-token"}
        expected_status: int = 400
        expected_message: str = "Invalid request format: start_time and end_time required."

        malformed_bodies: list[dict[str, Any]] = [
            {},
            {"start_time": "09:30"},
            {"end_time": "18:00"},
            {"start_time": "9:30", "end_time": "18:00"},
            {"start_time": "25:00", "end_time": "18:00"},
            {"start_time": "09:60", "end_time": "18:00"},
            {"start_time": "0930", "end_time": "18:00"},
            {"start_time": "abc", "end_time": "18:00"},
            {"start_time": 930, "end_time": "18:00"},
        ]

        for malformed_body in malformed_bodies:
            response: Response = client.put(
                "/api/settings/office-hours", json=malformed_body, headers=headers
            )
            assert response.status_code == expected_status, malformed_body
            assert response.get_json()["message"] == expected_message, malformed_body


def test_salesperson_refused_on_both_office_hours_endpoints(
    app: Flask, client: FlaskClient
) -> None:
    with app.app_context():
        create_user_fixture(name="manager1", role="manager", token="manager-token")
        create_user_fixture(name="salesperson1", token="sales-token")
        sales_headers: dict[str, str] = {"Authorization": "Bearer sales-token"}
        update_payload: dict[str, str] = {"start_time": "09:30", "end_time": "18:00"}
        expected_status: int = 403
        expected_message: str = "This setting is for managers."

        get_response: Response = client.get(
            "/api/settings/office-hours", headers=sales_headers
        )
        assert get_response.status_code == expected_status
        assert get_response.get_json()["message"] == expected_message

        put_response: Response = client.put(
            "/api/settings/office-hours", json=update_payload, headers=sales_headers
        )
        assert put_response.status_code == expected_status
        assert put_response.get_json()["message"] == expected_message

        manager_headers: dict[str, str] = {"Authorization": "Bearer manager-token"}
        stored_window: Response = client.get(
            "/api/settings/office-hours", headers=manager_headers
        )
        assert stored_window.get_json() == {"start_time": "10:00", "end_time": "19:00"}


def test_office_hours_unauthenticated_rejected(client: FlaskClient) -> None:
    get_response: Response = client.get("/api/settings/office-hours")
    expected_status: int = 401
    assert get_response.status_code == expected_status
    assert get_response.get_json()["message"] == "Invalid or expired token."

    put_response: Response = client.put(
        "/api/settings/office-hours", json={"start_time": "09:30", "end_time": "18:00"}
    )
    assert put_response.status_code == expected_status
    assert put_response.get_json()["message"] == "Invalid or expired token."
