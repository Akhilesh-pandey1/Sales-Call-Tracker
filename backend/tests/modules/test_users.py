from flask import Flask, Response
from flask.testing import FlaskClient
from sqlalchemy import text
from backend.app.core.security import hash_password
from backend.app.extensions import db
from backend.app.modules.users import User


def create_user_record(
    name: str,
    password: str = "Password123",
    role: str = "salesperson",
    country: str = "IN",
    is_active: bool = True,
    auth_token: str | None = None,
) -> User:
    user: User = User(
        name=name,
        password_hash=hash_password(password),
        role=role,
        country=country,
        is_active=is_active,
        auth_token=auth_token,
    )
    db.session.add(user)
    db.session.commit()
    return user


def ensure_auxiliary_tables() -> None:
    db.session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS calls (
                call_id VARCHAR(64) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                phone_number VARCHAR(30) NOT NULL,
                dialed_at TIMESTAMP NOT NULL,
                duration_seconds INTEGER NOT NULL DEFAULT 0
            );
            """
        )
    )
    db.session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number VARCHAR(30) UNIQUE NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'waiting',
                attempt_count INTEGER NOT NULL DEFAULT 0,
                last_attempted_at TIMESTAMP,
                retry_locked_until TIMESTAMP,
                claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                claimed_until TIMESTAMP,
                scheduled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                scheduled_at TIMESTAMP,
                created_at TIMESTAMP
            );
            """
        )
    )
    db.session.commit()


def test_get_users_non_manager_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "salesperson-token-123"
    with app.app_context():
        create_user_record(name="Ramesh", auth_token=token)
    response: Response = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    expected_status_forbidden: int = 403
    assert response.status_code == expected_status_forbidden


def test_get_users_unauthenticated_refused(client: FlaskClient) -> None:
    response: Response = client.get("/api/users")
    expected_status_unauthorized: int = 401
    assert response.status_code == expected_status_unauthorized


def test_get_users_manager_returns_all_accounts(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-123"
    with app.app_context():
        create_user_record(name="Manager", role="manager", auth_token=token)
        create_user_record(name="Ramesh", role="salesperson", is_active=True)
        create_user_record(name="Sunita", role="salesperson", country="AE", is_active=False)

    response: Response = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok

    json_data: list[dict[str, object]] = response.get_json()
    expected_count: int = 3
    assert len(json_data) == expected_count

    names_in_result: list[str] = [str(item["name"]) for item in json_data]
    assert "Manager" in names_in_result
    assert "Ramesh" in names_in_result
    assert "Sunita" in names_in_result

    expected_keys: set[str] = {"id", "name", "role", "country", "is_active"}
    assert set(json_data[0].keys()) == expected_keys


def test_create_user_successful(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-create"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    payload: dict[str, str] = {"name": "Sunita", "password": "Password123", "country": "IN"}
    response: Response = client.post(
        "/api/users", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_created: int = 201
    assert response.status_code == expected_status_created
    assert response.get_json()["status"] is True

    with app.app_context():
        created_user: User | None = User.query.filter_by(name="Sunita").first()
        assert created_user is not None
        assert created_user.country == "IN"
        assert created_user.role == "salesperson"
        assert created_user.is_active is True


def test_create_user_duplicate_name_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-dup"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        create_user_record(name="Sunita")

    payload: dict[str, str] = {"name": "Sunita", "password": "Password123", "country": "IN"}
    response: Response = client.post(
        "/api/users", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "That name is already taken."


def test_create_user_weak_password_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-weak"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    headers: dict[str, str] = {"Authorization": f"Bearer {token}"}
    expected_bad_request: int = 400
    expected_error: str = "Password needs 8+ characters with an uppercase and a lowercase letter."

    short_res: Response = client.post(
        "/api/users", json={"name": "U1", "password": "P1", "country": "IN"}, headers=headers
    )
    assert short_res.status_code == expected_bad_request
    assert short_res.get_json()["message"] == expected_error

    no_up_res: Response = client.post(
        "/api/users", json={"name": "U2", "password": "password123", "country": "IN"}, headers=headers
    )
    assert no_up_res.status_code == expected_bad_request
    assert no_up_res.get_json()["message"] == expected_error

    no_low_res: Response = client.post(
        "/api/users", json={"name": "U3", "password": "PASSWORD123", "country": "IN"}, headers=headers
    )
    assert no_low_res.status_code == expected_bad_request
    assert no_low_res.get_json()["message"] == expected_error


def test_create_user_invalid_country_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-country"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    payload: dict[str, str] = {"name": "UserUK", "password": "Password123", "country": "GB"}
    response: Response = client.post(
        "/api/users", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "Country must be one of: IN, AE, US."


def test_create_user_non_manager_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "salesperson-token-create"
    with app.app_context():
        create_user_record(name="Ramesh", auth_token=token)

    payload: dict[str, str] = {"name": "NewUser", "password": "Password123", "country": "IN"}
    response: Response = client.post(
        "/api/users", json=payload, headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_forbidden: int = 403
    assert response.status_code == expected_status_forbidden


def test_update_user_name_success(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-name"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"name": "Sunita Sharma"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        updated_user: User | None = db.session.get(User, user_id)
        assert updated_user is not None
        assert updated_user.name == "Sunita Sharma"


def test_update_user_duplicate_name_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-dup"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        create_user_record(name="ExistingPerson")
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"name": "ExistingPerson"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "That name is already taken."


def test_update_user_password_invalidates_old_token(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-pwd"
    old_salesperson_token: str = "old-salesperson-token"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita", auth_token=old_salesperson_token)
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"password": "BrandNewPassword1"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    protected_response: Response = client.get(
        "/api/users", headers={"Authorization": f"Bearer {old_salesperson_token}"}
    )
    expected_status_unauthorized: int = 401
    assert protected_response.status_code == expected_status_unauthorized


def test_update_user_weak_password_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-weak"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"password": "weak"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert (
        response.get_json()["message"]
        == "Password needs 8+ characters with an uppercase and a lowercase letter."
    )


def test_update_user_country_success(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-country"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita", country="IN")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"country": "AE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        updated_user: User | None = db.session.get(User, user_id)
        assert updated_user is not None
        assert updated_user.country == "AE"


def test_update_user_invalid_country_rejected(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-bad-country"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/update",
        json={"country": "ZZ"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "Country must be one of: IN, AE, US."


def test_update_user_manager_edits_own_account(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-own-edit"
    manager_id: int
    with app.app_context():
        manager: User = create_user_record(
            name="AdminManager", role="manager", country="IN", auth_token=token
        )
        manager_id = manager.id

    payload: dict[str, str] = {"name": "NewManagerName", "country": "US"}
    response: Response = client.post(
        f"/api/users/{manager_id}/update",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        updated_manager: User | None = db.session.get(User, manager_id)
        assert updated_manager is not None
        assert updated_manager.name == "NewManagerName"
        assert updated_manager.country == "US"


def test_update_user_not_found(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-upd-404"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    response: Response = client.post(
        "/api/users/9999/update",
        json={"name": "NonExistent"},
        headers={"Authorization": f"Bearer {token}"},
    )
    expected_status_not_found: int = 404
    assert response.status_code == expected_status_not_found
    assert response.get_json()["message"] == "User not found."


def test_deactivate_user_success(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-deact"
    salesperson_token: str = "salesperson-token-deact"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(
            name="Sunita", password="Password123", auth_token=salesperson_token
        )
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/deactivate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        deactivated_user: User | None = db.session.get(User, user_id)
        assert deactivated_user is not None
        assert deactivated_user.is_active is False
        assert deactivated_user.auth_token is None

    login_response: Response = client.post(
        "/api/login", json={"name": "Sunita", "password": "Password123"}
    )
    expected_status_forbidden: int = 403
    assert login_response.status_code == expected_status_forbidden
    assert (
        login_response.get_json()["message"]
        == "Your account is not active. Please contact your manager."
    )


def test_deactivate_user_calls_kept(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-deact-calls"
    user_id: int
    with app.app_context():
        ensure_auxiliary_tables()
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

        db.session.execute(
            text(
                "INSERT INTO calls (call_id, user_id, phone_number, dialed_at, duration_seconds) "
                "VALUES ('call-keep-1', :user_id, '+919876543210', '2026-10-15 00:00:00', 30)"
            ),
            {"user_id": user_id},
        )
        db.session.commit()

    response: Response = client.post(
        f"/api/users/{user_id}/deactivate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok

    with app.app_context():
        call_count = db.session.execute(
            text("SELECT count(*) FROM calls WHERE user_id = :user_id"),
            {"user_id": user_id},
        ).scalar()
        expected_call_count: int = 1
        assert call_count == expected_call_count


def test_deactivate_user_self_deactivation_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-self-deact"
    manager_id: int
    with app.app_context():
        manager: User = create_user_record(name="AdminManager", role="manager", auth_token=token)
        manager_id = manager.id

    response: Response = client.post(
        f"/api/users/{manager_id}/deactivate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "You cannot do this to your own account."


def test_deactivate_user_not_found(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-deact-404"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    response: Response = client.post(
        "/api/users/9999/deactivate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_not_found: int = 404
    assert response.status_code == expected_status_not_found
    assert response.get_json()["message"] == "User not found."


def test_deactivate_user_non_manager_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "salesperson-token-deact-perm"
    user_id: int
    with app.app_context():
        create_user_record(name="Ramesh", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/deactivate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_forbidden: int = 403
    assert response.status_code == expected_status_forbidden


def test_activate_user_success(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-act"
    user_id: int
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(
            name="Sunita", password="Password123", is_active=False, auth_token=None
        )
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/activate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        activated_user: User | None = db.session.get(User, user_id)
        assert activated_user is not None
        assert activated_user.is_active is True

    login_response: Response = client.post(
        "/api/login", json={"name": "Sunita", "password": "Password123"}
    )
    assert login_response.status_code == expected_status_ok
    assert login_response.get_json()["token"] is not None


def test_activate_user_not_found(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-act-404"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    response: Response = client.post(
        "/api/users/9999/activate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_not_found: int = 404
    assert response.status_code == expected_status_not_found
    assert response.get_json()["message"] == "User not found."


def test_activate_user_non_manager_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "salesperson-token-act-perm"
    user_id: int
    with app.app_context():
        create_user_record(name="Ramesh", auth_token=token)
        user: User = create_user_record(name="Sunita", is_active=False)
        user_id = user.id

    response: Response = client.post(
        f"/api/users/{user_id}/activate", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_forbidden: int = 403
    assert response.status_code == expected_status_forbidden


def test_delete_user_removes_user_and_calls(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-del"
    user_id: int
    with app.app_context():
        ensure_auxiliary_tables()
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

        db.session.execute(
            text(
                "INSERT INTO calls (call_id, user_id, phone_number, dialed_at, duration_seconds) "
                "VALUES ('call-123', :user_id, '+919876543210', '2026-10-15 00:00:00', 45)"
            ),
            {"user_id": user_id},
        )
        db.session.commit()

    response: Response = client.delete(
        f"/api/users/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok
    assert response.get_json()["status"] is True

    with app.app_context():
        deleted_user: User | None = db.session.get(User, user_id)
        assert deleted_user is None

        remaining_calls = db.session.execute(
            text("SELECT count(*) FROM calls WHERE user_id = :user_id"),
            {"user_id": user_id},
        ).scalar()
        expected_remaining_calls: int = 0
        assert remaining_calls == expected_remaining_calls


def test_delete_user_self_deletion_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-self-del"
    manager_id: int
    with app.app_context():
        manager: User = create_user_record(name="AdminManager", role="manager", auth_token=token)
        manager_id = manager.id

    response: Response = client.delete(
        f"/api/users/{manager_id}", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_bad_request: int = 400
    assert response.status_code == expected_status_bad_request
    assert response.get_json()["message"] == "You cannot do this to your own account."


def test_delete_user_releases_lead_claims(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-del-claim"
    user_id: int
    with app.app_context():
        ensure_auxiliary_tables()
        create_user_record(name="AdminManager", role="manager", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

        db.session.execute(
            text(
                "INSERT INTO leads (phone_number, status, claimed_by, claimed_until) "
                "VALUES ('+919876543211', 'waiting', :user_id, '2026-10-15 01:00:00')"
            ),
            {"user_id": user_id},
        )
        db.session.commit()

    response: Response = client.delete(
        f"/api/users/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_ok: int = 200
    assert response.status_code == expected_status_ok

    with app.app_context():
        lead_row = db.session.execute(
            text(
                "SELECT claimed_by, claimed_until FROM leads WHERE phone_number = '+919876543211'"
            )
        ).mappings().first()
        assert lead_row is not None
        assert lead_row["claimed_by"] is None
        assert lead_row["claimed_until"] is None


def test_delete_user_not_found(app: Flask, client: FlaskClient) -> None:
    token: str = "manager-token-del-404"
    with app.app_context():
        create_user_record(name="AdminManager", role="manager", auth_token=token)

    response: Response = client.delete(
        "/api/users/9999", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_not_found: int = 404
    assert response.status_code == expected_status_not_found
    assert response.get_json()["message"] == "User not found."


def test_delete_user_non_manager_refused(app: Flask, client: FlaskClient) -> None:
    token: str = "salesperson-token-del-perm"
    user_id: int
    with app.app_context():
        create_user_record(name="Ramesh", auth_token=token)
        user: User = create_user_record(name="Sunita")
        user_id = user.id

    response: Response = client.delete(
        f"/api/users/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    expected_status_forbidden: int = 403
    assert response.status_code == expected_status_forbidden
