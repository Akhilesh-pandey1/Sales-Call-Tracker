from datetime import datetime, timedelta, timezone
from flask import Flask, Response, g, jsonify
from flask.testing import FlaskClient
import pytest
from sqlalchemy import inspect, text
from backend.app import migrate_legacy_auth_tokens_to_sessions
from backend.app.core.permissions import require_auth
from backend.app.core.security import generate_auth_token, hash_password
from backend.app.extensions import db
from backend.app.modules.auth import Session
from backend.app.modules.auth.services import reset_lockout_state, set_lockout_expiry
from backend.app.modules.users import User


@pytest.fixture(autouse=True)
def clean_lockout_state() -> None:
    reset_lockout_state()





def test_login_missing_fields(client: FlaskClient) -> None:
    empty_body_response: Response = client.post("/api/login", json={})
    expected_status_bad_request: int = 400
    assert empty_body_response.status_code == expected_status_bad_request
    empty_body_json: dict[str, str] = empty_body_response.get_json()
    assert empty_body_json["message"] == "Name and password are required."

    missing_password_response: Response = client.post(
        "/api/login",
        json={"name": "alice"},
    )
    assert missing_password_response.status_code == expected_status_bad_request
    missing_password_json: dict[str, str] = missing_password_response.get_json()
    assert missing_password_json["message"] == "Name and password are required."

    missing_name_response: Response = client.post(
        "/api/login",
        json={"password": "SecretPassword1"},
    )
    assert missing_name_response.status_code == expected_status_bad_request
    missing_name_json: dict[str, str] = missing_name_response.get_json()
    assert missing_name_json["message"] == "Name and password are required."

    empty_strings_response: Response = client.post(
        "/api/login",
        json={"name": "   ", "password": "   "},
    )
    assert empty_strings_response.status_code == expected_status_bad_request
    empty_strings_json: dict[str, str] = empty_strings_response.get_json()
    assert empty_strings_json["message"] == "Name and password are required."


def test_login_wrong_credentials(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = User(
            name="alice",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    wrong_password_response: Response = client.post(
        "/api/login",
        json={"name": "alice", "password": "WrongPassword1"},
    )
    expected_unauthorized_status: int = 401
    assert wrong_password_response.status_code == expected_unauthorized_status
    wrong_password_json: dict[str, str] = wrong_password_response.get_json()
    assert wrong_password_json["message"] == "Wrong name or password."

    name_not_found_response: Response = client.post(
        "/api/login",
        json={"name": "unknown_user", "password": "AnyPassword1"},
    )
    assert name_not_found_response.status_code == expected_unauthorized_status
    name_not_found_json: dict[str, str] = name_not_found_response.get_json()
    assert name_not_found_json["message"] == "Wrong name or password."


def test_login_deactivated_account(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        deactivated_user: User = User(
            name="bob_inactive",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=False,
        )
        db.session.add(deactivated_user)
        db.session.commit()

    response: Response = client.post(
        "/api/login",
        json={"name": "bob_inactive", "password": "ValidPassword1"},
    )
    expected_forbidden_status: int = 403
    assert response.status_code == expected_forbidden_status
    json_data: dict[str, str] = response.get_json()
    assert (
        json_data["message"]
        == "Your account is not active. Please contact your manager."
    )


def test_login_success(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        active_user: User = User(
            name="carol_active",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(active_user)
        db.session.commit()

    response: Response = client.post(
        "/api/login",
        json={"name": "carol_active", "password": "ValidPassword1"},
    )
    expected_ok_status: int = 200
    assert response.status_code == expected_ok_status
    json_data: dict[str, object] = response.get_json()
    assert json_data["name"] == "carol_active"
    assert json_data["role"] == "salesperson"
    assert json_data["country"] == "IN"
    token: object = json_data["token"]
    assert isinstance(token, str)
    expected_token_length: int = 64
    assert len(token) == expected_token_length

    with app.app_context():
        persisted_user: User | None = User.query.filter_by(
            name="carol_active"
        ).first()
        assert persisted_user is not None
        persisted_session: Session | None = Session.query.filter_by(
            token=token
        ).first()
        assert persisted_session is not None
        assert persisted_session.user_id == persisted_user.id


def test_login_lockout_triggered(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = User(
            name="dan_lockout",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    expected_unauthorized_status: int = 401
    total_failures_to_lock: int = 10
    for _ in range(total_failures_to_lock):
        failed_response: Response = client.post(
            "/api/login",
            json={"name": "dan_lockout", "password": "WrongPassword1"},
        )
        assert failed_response.status_code == expected_unauthorized_status

    locked_response: Response = client.post(
        "/api/login",
        json={"name": "dan_lockout", "password": "ValidPassword1"},
    )
    expected_too_many_requests_status: int = 429
    assert locked_response.status_code == expected_too_many_requests_status
    locked_json: dict[str, str] = locked_response.get_json()
    assert (
        locked_json["message"]
        == "Too many tries. Wait 5 minutes and try again."
    )


def test_login_lockout_expires(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = User(
            name="eve_expires",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    total_failures_to_lock: int = 10
    for _ in range(total_failures_to_lock):
        client.post(
            "/api/login",
            json={"name": "eve_expires", "password": "WrongPassword1"},
        )

    locked_response: Response = client.post(
        "/api/login",
        json={"name": "eve_expires", "password": "ValidPassword1"},
    )
    expected_too_many_requests_status: int = 429
    assert locked_response.status_code == expected_too_many_requests_status

    expired_time: datetime = datetime.now(timezone.utc) - timedelta(seconds=1)
    set_lockout_expiry("eve_expires", expired_time)

    success_response: Response = client.post(
        "/api/login",
        json={"name": "eve_expires", "password": "ValidPassword1"},
    )
    expected_ok_status: int = 200
    assert success_response.status_code == expected_ok_status



def test_login_counter_reset_on_success(app: Flask, client: FlaskClient) -> None:
    with app.app_context():
        user: User = User(
            name="frank_reset",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    partial_failures: int = 9
    expected_unauthorized_status: int = 401
    for _ in range(partial_failures):
        failed_response: Response = client.post(
            "/api/login",
            json={"name": "frank_reset", "password": "WrongPassword1"},
        )
        assert failed_response.status_code == expected_unauthorized_status

    success_response: Response = client.post(
        "/api/login",
        json={"name": "frank_reset", "password": "ValidPassword1"},
    )
    expected_ok_status: int = 200
    assert success_response.status_code == expected_ok_status

    for _ in range(partial_failures):
        failed_response = client.post(
            "/api/login",
            json={"name": "frank_reset", "password": "WrongPassword1"},
        )
        assert failed_response.status_code == expected_unauthorized_status



def test_require_auth_valid_token(app: Flask, client: FlaskClient) -> None:
    @app.get("/api/test-protected")
    @require_auth
    def sample_protected_route() -> tuple[Response, int]:
        current_user: User = g.user
        payload: dict[str, object] = {
            "id": current_user.id,
            "name": current_user.name,
        }
        response: Response = jsonify(payload)
        success_status: int = 200
        return response, success_status

    token: str = generate_auth_token()
    with app.app_context():
        user: User = User(
            name="grace_protected",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()
        user_session: Session = Session(user_id=user.id, token=token)
        db.session.add(user_session)
        db.session.commit()

    headers: dict[str, str] = {"Authorization": f"Bearer {token}"}
    response: Response = client.get("/api/test-protected", headers=headers)
    expected_ok_status: int = 200
    assert response.status_code == expected_ok_status
    json_data: dict[str, object] = response.get_json()
    assert json_data["name"] == "grace_protected"


def test_require_auth_missing_or_invalid_token(
    app: Flask, client: FlaskClient
) -> None:
    @app.get("/api/test-protected-guard")
    @require_auth
    def sample_protected_route() -> tuple[Response, int]:
        response: Response = jsonify({"status": "ok"})
        success_status: int = 200
        return response, success_status

    missing_header_response: Response = client.get("/api/test-protected-guard")
    expected_unauthorized_status: int = 401
    assert missing_header_response.status_code == expected_unauthorized_status
    missing_header_json: dict[str, str] = missing_header_response.get_json()
    assert missing_header_json["message"] == "Invalid or expired token."

    invalid_scheme_headers: dict[str, str] = {
        "Authorization": "Basic somecredentials"
    }
    invalid_scheme_response: Response = client.get(
        "/api/test-protected-guard", headers=invalid_scheme_headers
    )
    assert invalid_scheme_response.status_code == expected_unauthorized_status
    invalid_scheme_json: dict[str, str] = invalid_scheme_response.get_json()
    assert invalid_scheme_json["message"] == "Invalid or expired token."

    unknown_token_headers: dict[str, str] = {
        "Authorization": "Bearer non_existent_token_value"
    }
    unknown_token_response: Response = client.get(
        "/api/test-protected-guard", headers=unknown_token_headers
    )
    assert unknown_token_response.status_code == expected_unauthorized_status
    unknown_token_json: dict[str, str] = unknown_token_response.get_json()
    assert unknown_token_json["message"] == "Invalid or expired token."


def test_require_auth_deactivated_user(app: Flask, client: FlaskClient) -> None:
    @app.get("/api/test-protected-deactivated")
    @require_auth
    def sample_protected_route() -> tuple[Response, int]:
        response: Response = jsonify({"status": "ok"})
        success_status: int = 200
        return response, success_status

    token: str = generate_auth_token()
    with app.app_context():
        user: User = User(
            name="heidi_inactive",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=False,
        )
        db.session.add(user)
        db.session.commit()
        user_session: Session = Session(user_id=user.id, token=token)
        db.session.add(user_session)
        db.session.commit()

    headers: dict[str, str] = {"Authorization": f"Bearer {token}"}
    response: Response = client.get(
        "/api/test-protected-deactivated", headers=headers
    )
    expected_forbidden_status: int = 403
    assert response.status_code == expected_forbidden_status
    json_data: dict[str, str] = response.get_json()
    assert (
        json_data["message"]
        == "Your account is not active. Please contact your manager."
    )


def test_relogin_keeps_older_sessions_working(app: Flask, client: FlaskClient) -> None:
    @app.get("/api/test-two-sessions")
    @require_auth
    def sample_protected_route() -> tuple[Response, int]:
        response: Response = jsonify({"status": "ok"})
        success_status: int = 200
        return response, success_status

    with app.app_context():
        user: User = User(
            name="ivan_sessions",
            password_hash=hash_password("ValidPassword1"),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    first_login_response: Response = client.post(
        "/api/login",
        json={"name": "ivan_sessions", "password": "ValidPassword1"},
    )
    expected_ok_status: int = 200
    assert first_login_response.status_code == expected_ok_status
    first_token: str = str(first_login_response.get_json()["token"])

    first_auth_headers: dict[str, str] = {
        "Authorization": f"Bearer {first_token}"
    }
    first_auth_response: Response = client.get(
        "/api/test-two-sessions", headers=first_auth_headers
    )
    assert first_auth_response.status_code == expected_ok_status

    second_login_response: Response = client.post(
        "/api/login",
        json={"name": "ivan_sessions", "password": "ValidPassword1"},
    )
    assert second_login_response.status_code == expected_ok_status
    second_token: str = str(second_login_response.get_json()["token"])
    assert first_token != second_token

    second_auth_headers: dict[str, str] = {
        "Authorization": f"Bearer {second_token}"
    }
    second_auth_response: Response = client.get(
        "/api/test-two-sessions", headers=second_auth_headers
    )
    assert second_auth_response.status_code == expected_ok_status

    first_token_still_valid_response: Response = client.get(
        "/api/test-two-sessions", headers=first_auth_headers
    )
    assert first_token_still_valid_response.status_code == expected_ok_status

    with app.app_context():
        persisted_user: User | None = User.query.filter_by(
            name="ivan_sessions"
        ).first()
        assert persisted_user is not None
        user_session_count: int = Session.query.filter_by(
            user_id=persisted_user.id
        ).count()
        expected_session_count: int = 2
        assert user_session_count == expected_session_count


def test_password_change_keeps_acting_session_and_rejects_others(
    app: Flask, client: FlaskClient
) -> None:
    @app.get("/api/test-password-change-route")
    @require_auth
    def sample_protected_route() -> tuple[Response, int]:
        response: Response = jsonify({"status": "ok"})
        success_status: int = 200
        return response, success_status

    acting_token: str = generate_auth_token()
    other_device_token: str = generate_auth_token()
    manager_id: int
    with app.app_context():
        manager: User = User(
            name="jack_reset",
            password_hash=hash_password("ValidPassword1"),
            role="manager",
            country="IN",
            is_active=True,
        )
        db.session.add(manager)
        db.session.commit()
        manager_id = manager.id
        acting_session: Session = Session(user_id=manager_id, token=acting_token)
        other_device_session: Session = Session(
            user_id=manager_id, token=other_device_token
        )
        db.session.add(acting_session)
        db.session.add(other_device_session)
        db.session.commit()

    acting_headers: dict[str, str] = {"Authorization": f"Bearer {acting_token}"}
    update_response: Response = client.post(
        f"/api/users/{manager_id}/update",
        json={"password": "NewPassword1"},
        headers=acting_headers,
    )
    expected_ok_status: int = 200
    assert update_response.status_code == expected_ok_status
    assert update_response.get_json()["status"] is True

    acting_session_response: Response = client.get(
        "/api/test-password-change-route", headers=acting_headers
    )
    assert acting_session_response.status_code == expected_ok_status

    other_device_headers: dict[str, str] = {
        "Authorization": f"Bearer {other_device_token}"
    }
    rejected_response: Response = client.get(
        "/api/test-password-change-route", headers=other_device_headers
    )
    expected_unauthorized_status: int = 401
    assert rejected_response.status_code == expected_unauthorized_status
    rejected_json: dict[str, str] = rejected_response.get_json()
    assert rejected_json["message"] == "Invalid or expired token."


def test_login_preserves_password_whitespace(
    app: Flask, client: FlaskClient
) -> None:
    password_with_spaces: str = "  SecretWithSpaces1  "
    with app.app_context():
        user: User = User(
            name="ken_spaces",
            password_hash=hash_password(password_with_spaces),
            role="salesperson",
            country="IN",
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()

    response: Response = client.post(
        "/api/login",
        json={"name": "ken_spaces", "password": password_with_spaces},
    )
    expected_ok_status: int = 200
    assert response.status_code == expected_ok_status


def test_legacy_tokens_become_sessions_rows(app: Flask) -> None:
    with app.app_context():
        db.drop_all()
        db.session.execute(
            text(
                "CREATE TABLE users ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "name VARCHAR(100) UNIQUE NOT NULL, "
                "password_hash VARCHAR(255) NOT NULL, "
                "role VARCHAR(20) NOT NULL DEFAULT 'salesperson', "
                "is_active BOOLEAN NOT NULL DEFAULT TRUE, "
                "country VARCHAR(5) NOT NULL DEFAULT 'IN', "
                "auth_token VARCHAR(255), "
                "created_at DATETIME)"
            )
        )
        db.session.execute(
            text(
                "CREATE TABLE sessions ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, "
                "token VARCHAR(255) NOT NULL UNIQUE, "
                "created_at DATETIME)"
            )
        )
        db.session.execute(
            text(
                "INSERT INTO users (name, password_hash, auth_token) VALUES "
                "('alice_legacy', 'hash', 'legacy-token-alice'), "
                "('bob_legacy', 'hash', 'legacy-token-bob'), "
                "('carol_legacy', 'hash', NULL)"
            )
        )
        db.session.commit()

        migrate_legacy_auth_tokens_to_sessions()

        moved_session_count: int | None = db.session.execute(
            text("SELECT count(*) FROM sessions")
        ).scalar()
        expected_moved_sessions: int = 2
        assert moved_session_count == expected_moved_sessions

        alice_user_id: int | None = db.session.execute(
            text("SELECT id FROM users WHERE name = 'alice_legacy'")
        ).scalar()
        alice_session_row = db.session.execute(
            text(
                "SELECT user_id, created_at FROM sessions "
                "WHERE token = 'legacy-token-alice'"
            )
        ).mappings().first()
        assert alice_session_row is not None
        assert alice_session_row["user_id"] == alice_user_id
        assert alice_session_row["created_at"] is not None

        user_column_names: list[str] = [
            column["name"] for column in inspect(db.engine).get_columns("users")
        ]
        assert "auth_token" not in user_column_names

        migrate_legacy_auth_tokens_to_sessions()
        rerun_session_count: int | None = db.session.execute(
            text("SELECT count(*) FROM sessions")
        ).scalar()
        assert rerun_session_count == expected_moved_sessions



