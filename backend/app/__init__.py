import os
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from sqlalchemy import inspect, text

load_dotenv()

from backend.app.api import api_blueprint
from backend.app.config.base import BaseConfig
from backend.app.config.dev import DevConfig
from backend.app.config.prod import ProdConfig
from backend.app.core.errors import register_error_handlers
from backend.app.core.security import hash_password
from backend.app.extensions import db
from backend.app.modules.settings import get_or_create_office_hours_window
from backend.app.modules.users.models import User
from backend.app.static_routes import register_static_routes
from backend.app.tasks.lead_expiry import start_lead_expiry_scheduler


def create_initial_manager(app: Flask) -> None:
    if app.config.get("TESTING"):
        return

    manager_name: str = os.getenv("MANAGER_NAME", "")
    manager_password: str = os.getenv("MANAGER_PASSWORD", "")

    if not manager_name or not manager_password:
        raise RuntimeError("Set MANAGER_NAME and MANAGER_PASSWORD in the .env file so the manager account can be created.")

    existing_manager: User | None = User.query.filter_by(name=manager_name).first()
    if existing_manager is not None:
        return

    password_hash: str = hash_password(manager_password)
    new_manager: User = User(
        name=manager_name,
        password_hash=password_hash,
        role="manager",
        is_active=True,
        country="IN",
    )
    db.session.add(new_manager)
    db.session.commit()


def ensure_table_column(table_name: str, column_name: str) -> None:
    allowed_columns_by_table: dict[str, dict[str, str]] = {
        "calls": {
            "interested": "BOOLEAN NOT NULL DEFAULT FALSE",
            "do_not_call": "BOOLEAN NOT NULL DEFAULT FALSE",
            "notes": "TEXT",
            "direction": "VARCHAR(10) NOT NULL DEFAULT 'outgoing'",
        },
        "leads": {
            "interested": "BOOLEAN NOT NULL DEFAULT FALSE",
            "do_not_call": "BOOLEAN NOT NULL DEFAULT FALSE",
            "notes": "TEXT",
        },
    }
    table_columns: dict[str, str] | None = allowed_columns_by_table.get(table_name)
    if table_columns is None or column_name not in table_columns:
        raise ValueError(
            f"Column {column_name} is not allowed on the {table_name} table."
        )
    column_definition: str = table_columns[column_name]

    database_inspector = inspect(db.engine)
    existing_column_names: list[str] = [
        column["name"] for column in database_inspector.get_columns(table_name)
    ]
    if column_name in existing_column_names:
        return

    is_postgres_database: bool = db.engine.dialect.name == "postgresql"
    if is_postgres_database:
        add_column_statement = text(
            f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {column_name} {column_definition}"
        )
    else:
        add_column_statement = text(
            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"
        )
    db.session.execute(add_column_statement)
    db.session.commit()


def drop_legacy_auth_token_column() -> None:
    users_table_name: str = "users"
    legacy_column_name: str = "auth_token"

    is_postgres_database: bool = db.engine.dialect.name == "postgresql"
    database_inspector = inspect(db.engine)

    if is_postgres_database:
        db.session.execute(
            text("ALTER TABLE users DROP COLUMN IF EXISTS auth_token")
        )
        db.session.commit()
        return

    user_indexes: list[dict[str, Any]] = database_inspector.get_indexes(
        users_table_name
    )
    for user_index in user_indexes:
        if legacy_column_name not in user_index["column_names"]:
            continue
        blocking_index_name: str = user_index["name"]
        db.session.execute(
            text(f"DROP INDEX IF EXISTS {blocking_index_name}")
        )
    db.session.commit()
    db.session.execute(text("ALTER TABLE users DROP COLUMN auth_token"))
    db.session.commit()


def migrate_legacy_auth_tokens_to_sessions() -> None:
    legacy_column_name: str = "auth_token"

    database_inspector = inspect(db.engine)
    user_column_names: list[str] = [
        column["name"] for column in database_inspector.get_columns("users")
    ]
    if legacy_column_name not in user_column_names:
        return

    legacy_token_rows: list[Mapping[str, Any]] = (
        db.session.execute(
            text("SELECT id, auth_token FROM users WHERE auth_token IS NOT NULL")
        )
        .mappings()
        .all()
    )

    migrated_at: str = datetime.now(timezone.utc).isoformat()
    for legacy_row in legacy_token_rows:
        legacy_token: str = legacy_row["auth_token"]
        existing_session_id: int | None = db.session.execute(
            text("SELECT id FROM sessions WHERE token = :token"),
            {"token": legacy_token},
        ).scalar()
        if existing_session_id is not None:
            continue

        db.session.execute(
            text(
                "INSERT INTO sessions (user_id, token, created_at) "
                "VALUES (:user_id, :token, :created_at)"
            ),
            {
                "user_id": legacy_row["id"],
                "token": legacy_token,
                "created_at": migrated_at,
            },
        )
    db.session.commit()

    drop_legacy_auth_token_column()


def create_app(config_class: type[BaseConfig] | None = None) -> Flask:
    app: Flask = Flask(__name__)

    active_config: type[BaseConfig]
    if config_class is not None:
        active_config = config_class
    elif os.getenv("FLASK_ENV") == "production":
        active_config = ProdConfig
    else:
        active_config = DevConfig

    app.config.from_object(active_config)

    db.init_app(app)
    CORS(app)
    register_error_handlers(app)
    app.register_blueprint(api_blueprint)
    register_static_routes(app)

    with app.app_context():
        db.create_all()
        ensure_table_column("calls", "interested")
        ensure_table_column("calls", "do_not_call")
        ensure_table_column("calls", "notes")
        ensure_table_column("calls", "direction")
        ensure_table_column("leads", "interested")
        ensure_table_column("leads", "do_not_call")
        ensure_table_column("leads", "notes")
        migrate_legacy_auth_tokens_to_sessions()
        get_or_create_office_hours_window()
        create_initial_manager(app)

    start_lead_expiry_scheduler(app)

    return app
