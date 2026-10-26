from pathlib import Path
from flask import Flask, Response
from flask.testing import FlaskClient
from sqlalchemy import create_engine, inspect, text
from zoneinfo import ZoneInfo
from backend.app import create_app
from backend.app.config.base import BaseConfig
from backend.app.core.errors import AppException
from backend.app.core.security import (
    generate_auth_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from backend.app.core.utils import (
    get_ist_timezone,
    normalize_phone_number,
    now_ist,
    now_utc,
    to_ist,
)
from backend.app.extensions import db
from backend.app.modules.calls.models import Call
from backend.app.modules.users.models import User


def test_app_creation(app: Flask) -> None:
    is_testing: bool = app.config["TESTING"]
    assert is_testing is True


def test_startup_adds_call_outcome_columns_to_existing_database(
    tmp_path: Path,
) -> None:
    database_path: Path = tmp_path / "existing-database.sqlite"
    database_url: str = f"sqlite:///{database_path.as_posix()}"

    legacy_engine = create_engine(database_url)
    create_legacy_calls_table_statement = text(
        "CREATE TABLE calls ("
        "call_id VARCHAR(64) PRIMARY KEY, "
        "user_id INTEGER, "
        "phone_number VARCHAR(30) NOT NULL, "
        "dialed_at TIMESTAMP, "
        "duration_seconds INTEGER NOT NULL DEFAULT 0)"
    )
    insert_legacy_call_statement = text(
        "INSERT INTO calls (call_id, user_id, phone_number, dialed_at, duration_seconds) "
        "VALUES ('existing-call', 1, '+919876543210', '2026-10-01 10:00:00.000000', 30)"
    )
    with legacy_engine.begin() as connection:
        connection.execute(create_legacy_calls_table_statement)
        connection.execute(insert_legacy_call_statement)
    legacy_engine.dispose()

    class ExistingDatabaseConfig(BaseConfig):
        TESTING: bool = True
        SQLALCHEMY_DATABASE_URI: str = database_url

    application: Flask = create_app(ExistingDatabaseConfig)
    with application.app_context():
        database_inspector = inspect(db.engine)
        existing_column_names: list[str] = [
            column["name"] for column in database_inspector.get_columns("calls")
        ]
        stored_existing_call: Call | None = db.session.get(Call, "existing-call")
        db.session.remove()
        db.engine.dispose()

    assert "interested" in existing_column_names
    assert "do_not_call" in existing_column_names
    assert "notes" in existing_column_names
    assert stored_existing_call is not None
    assert stored_existing_call.interested is False
    assert stored_existing_call.do_not_call is False
    assert stored_existing_call.notes is None


def test_startup_drops_legacy_outcome_column_from_existing_database(
    tmp_path: Path,
) -> None:
    database_path: Path = tmp_path / "legacy-outcome-database.sqlite"
    database_url: str = f"sqlite:///{database_path.as_posix()}"

    legacy_engine = create_engine(database_url)
    create_legacy_calls_table_statement = text(
        "CREATE TABLE calls ("
        "call_id VARCHAR(64) PRIMARY KEY, "
        "user_id INTEGER, "
        "phone_number VARCHAR(30) NOT NULL, "
        "dialed_at TIMESTAMP, "
        "duration_seconds INTEGER NOT NULL DEFAULT 0, "
        "outcome VARCHAR(30))"
    )
    insert_legacy_call_statement = text(
        "INSERT INTO calls (call_id, user_id, phone_number, dialed_at, duration_seconds, outcome) "
        "VALUES ('legacy-call', 1, '+919876543210', '2026-10-01 10:00:00.000000', 30, 'yes')"
    )
    with legacy_engine.begin() as connection:
        connection.execute(create_legacy_calls_table_statement)
        connection.execute(insert_legacy_call_statement)
    legacy_engine.dispose()

    class ExistingDatabaseConfig(BaseConfig):
        TESTING: bool = True
        SQLALCHEMY_DATABASE_URI: str = database_url

    application: Flask = create_app(ExistingDatabaseConfig)
    with application.app_context():
        database_inspector = inspect(db.engine)
        existing_column_names: list[str] = [
            column["name"] for column in database_inspector.get_columns("calls")
        ]
        stored_legacy_call: Call | None = db.session.get(Call, "legacy-call")
        db.session.remove()
        db.engine.dispose()

    assert "outcome" not in existing_column_names
    assert "user_id" in existing_column_names
    assert "phone_number" in existing_column_names
    assert "dialed_at" in existing_column_names
    assert "duration_seconds" in existing_column_names
    assert "direction" in existing_column_names
    assert "interested" in existing_column_names
    assert "do_not_call" in existing_column_names
    assert "notes" in existing_column_names
    assert stored_legacy_call is not None
    assert stored_legacy_call.user_id == 1
    assert stored_legacy_call.interested is False


def test_startup_skips_outcome_cleanup_when_column_missing(
    tmp_path: Path,
) -> None:
    database_path: Path = tmp_path / "no-outcome-database.sqlite"
    database_url: str = f"sqlite:///{database_path.as_posix()}"

    legacy_engine = create_engine(database_url)
    create_calls_table_statement = text(
        "CREATE TABLE calls ("
        "call_id VARCHAR(64) PRIMARY KEY, "
        "user_id INTEGER, "
        "phone_number VARCHAR(30) NOT NULL, "
        "dialed_at TIMESTAMP, "
        "duration_seconds INTEGER NOT NULL DEFAULT 0)"
    )
    insert_call_statement = text(
        "INSERT INTO calls (call_id, user_id, phone_number, dialed_at, duration_seconds) "
        "VALUES ('kept-call', 1, '+919876543210', '2026-10-01 10:00:00.000000', 30)"
    )
    with legacy_engine.begin() as connection:
        connection.execute(create_calls_table_statement)
        connection.execute(insert_call_statement)
    legacy_engine.dispose()

    class ExistingDatabaseConfig(BaseConfig):
        TESTING: bool = True
        SQLALCHEMY_DATABASE_URI: str = database_url

    application: Flask = create_app(ExistingDatabaseConfig)
    with application.app_context():
        database_inspector = inspect(db.engine)
        existing_column_names: list[str] = [
            column["name"] for column in database_inspector.get_columns("calls")
        ]
        stored_call: Call | None = db.session.get(Call, "kept-call")
        db.session.remove()
        db.engine.dispose()

    assert "outcome" not in existing_column_names
    assert "user_id" in existing_column_names
    assert "direction" in existing_column_names
    assert "interested" in existing_column_names
    assert stored_call is not None
    assert stored_call.user_id == 1
    assert stored_call.duration_seconds == 30


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


def test_utils_helpers() -> None:
    tz: ZoneInfo = get_ist_timezone()
    assert tz.key == "Asia/Kolkata"

    current_ist = now_ist()
    assert current_ist.tzinfo is not None

    current_utc = now_utc()
    assert current_utc.tzinfo is not None

    converted = to_ist(current_utc)
    assert converted.tzinfo is not None

    normalized_in = normalize_phone_number("9876543210", "IN")
    assert normalized_in == "+919876543210"

