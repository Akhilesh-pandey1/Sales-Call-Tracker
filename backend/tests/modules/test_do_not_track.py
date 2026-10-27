import logging
from typing import Any
from flask import Flask, Response
from flask.testing import FlaskClient
import pytest
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


def test_correct_password_answers_ok(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}

        response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "manager-pass-1"},
            headers=headers,
        )
        expected_status: int = 200
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json == {"status": True}


def test_wrong_password_refused(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}

        response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "not-the-password"},
            headers=headers,
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json == {"message": "Wrong password. Ask your manager."}


def test_missing_or_empty_password_refused(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}
        expected_status: int = 400
        expected_message: str = "Password is required."

        invalid_bodies: list[dict[str, Any]] = [
            {},
            {"password": ""},
            {"password": None},
            {"password": 123},
        ]

        for invalid_body in invalid_bodies:
            response: Response = client.post(
                "/api/do-not-track/verify-remove-password",
                json=invalid_body,
                headers=headers,
            )
            assert response.status_code == expected_status, invalid_body
            assert response.get_json()["message"] == expected_message, invalid_body


def test_any_active_token_may_call_endpoint(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(
            name="manager1", role="manager", token="manager-token"
        )
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")

        manager_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "manager-pass-1"},
            headers={"Authorization": "Bearer manager-token"},
        )
        expected_status: int = 200
        assert manager_response.status_code == expected_status
        assert manager_response.get_json() == {"status": True}

        sales_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "manager-pass-1"},
            headers={"Authorization": "Bearer sales-token"},
        )
        assert sales_response.status_code == expected_status
        assert sales_response.get_json() == {"status": True}


def test_missing_token_rejected(client: FlaskClient) -> None:
    response: Response = client.post(
        "/api/do-not-track/verify-remove-password",
        json={"password": "manager-pass-1"},
    )
    expected_status: int = 401
    assert response.status_code == expected_status
    assert response.get_json() == {"message": "Invalid or expired token."}


def test_unknown_token_rejected(client: FlaskClient) -> None:
    response: Response = client.post(
        "/api/do-not-track/verify-remove-password",
        json={"password": "manager-pass-1"},
        headers={"Authorization": "Bearer no-such-token"},
    )
    expected_status: int = 401
    assert response.status_code == expected_status
    assert response.get_json() == {"message": "Invalid or expired token."}


def test_deactivated_account_token_refused(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(
            name="deactivated1", is_active=False, token="old-token"
        )
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")

        response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "manager-pass-1"},
            headers={"Authorization": "Bearer old-token"},
        )
        expected_status: int = 403
        assert response.status_code == expected_status
        response_json: dict[str, Any] = response.get_json()
        assert response_json == {
            "message": "Your account is not active. Please contact your manager."
        }


def test_unset_env_password_fails_closed(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.delenv("DO_NOT_TRACK_REMOVE_PASSWORD", raising=False)
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}
        expected_status: int = 503
        expected_message: str = "Removing is not available yet. Contact support."

        typed_password_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "manager-pass-1"},
            headers=headers,
        )
        assert typed_password_response.status_code == expected_status
        assert typed_password_response.get_json() == {"message": expected_message}

        empty_password_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": ""},
            headers=headers,
        )
        assert empty_password_response.status_code == 400


def test_env_password_read_when_request_arrives(
    app: Flask, client: FlaskClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}

        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "first-pass")
        first_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "first-pass"},
            headers=headers,
        )
        expected_status: int = 200
        assert first_response.status_code == expected_status

        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "second-pass")
        stale_password_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "first-pass"},
            headers=headers,
        )
        refused_status: int = 403
        assert stale_password_response.status_code == refused_status

        new_password_response: Response = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "second-pass"},
            headers=headers,
        )
        assert new_password_response.status_code == expected_status
        assert new_password_response.get_json() == {"status": True}


def test_failed_try_stays_visible_in_server_logs(
    app: Flask,
    client: FlaskClient,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    with app.app_context():
        create_user_fixture(name="salesperson1", token="sales-token")
        monkeypatch.setenv("DO_NOT_TRACK_REMOVE_PASSWORD", "manager-pass-1")
        headers: dict[str, str] = {"Authorization": "Bearer sales-token"}

        with caplog.at_level(logging.WARNING):
            client.post(
                "/api/do-not-track/verify-remove-password",
                json={"password": "not-the-password"},
                headers=headers,
            )

        refused_status: int = 403
        warning_texts: list[str] = [
            record.getMessage() for record in caplog.records
        ]
        assert any(
            "do-not-track" in warning_text and "wrong" in warning_text.lower()
            for warning_text in warning_texts
        )
        wrong_password_response_status = client.post(
            "/api/do-not-track/verify-remove-password",
            json={"password": "not-the-password"},
            headers=headers,
        ).status_code
        assert wrong_password_response_status == refused_status
