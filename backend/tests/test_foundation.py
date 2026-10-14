from flask import Flask, Response
from flask.testing import FlaskClient
from backend.app.core.errors import AppException
from backend.app.core.security import (
    generate_auth_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from backend.app.extensions import db
from backend.app.modules.users.models import User


def test_app_creation(app: Flask) -> None:
    is_testing: bool = app.config["TESTING"]
    assert is_testing is True


def test_user_model(app: Flask) -> None:
    hashed_pwd: str = hash_password("ValidPass123")
    user: User = User(
        name="sales_one",
        password_hash=hashed_pwd,
        role="salesperson",
        country="IN",
    )
    db.session.add(user)
    db.session.commit()

    retrieved: User | None = User.query.filter_by(name="sales_one").first()
    assert retrieved is not None
    assert retrieved.name == "sales_one"
    assert retrieved.role == "salesperson"
    assert retrieved.is_active is True
    assert retrieved.country == "IN"


def test_security_helpers() -> None:
    raw_pwd: str = "SecretPassword1"
    hashed_pwd: str = hash_password(raw_pwd)
    is_valid: bool = verify_password(hashed_pwd, raw_pwd)
    assert is_valid is True

    is_invalid: bool = verify_password(hashed_pwd, "WrongPassword")
    assert is_invalid is False

    token: str = generate_auth_token()
    assert len(token) == 64

    assert validate_password_strength("Pass1234") is True
    assert validate_password_strength("short") is False
    assert validate_password_strength("alllowercase1") is False
    assert validate_password_strength("ALLUPPERCASE1") is False


def test_error_handler(app: Flask, client: FlaskClient) -> None:
    @app.route("/test-error")
    def trigger_error() -> Response:
        raise AppException("Custom error message", 400)

    response: Response = client.get("/test-error")
    assert response.status_code == 400
    json_data: dict[str, str] = response.get_json()
    assert json_data["message"] == "Custom error message"
