import os

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


def ensure_calls_outcome_column() -> None:
    database_inspector = inspect(db.engine)
    existing_column_names: list[str] = [
        column["name"] for column in database_inspector.get_columns("calls")
    ]
    if "outcome" in existing_column_names:
        return

    is_postgres_database: bool = db.engine.dialect.name == "postgresql"
    if is_postgres_database:
        add_outcome_column_statement = text(
            "ALTER TABLE calls ADD COLUMN IF NOT EXISTS outcome VARCHAR(20)"
        )
    else:
        add_outcome_column_statement = text(
            "ALTER TABLE calls ADD COLUMN outcome VARCHAR(20)"
        )
    db.session.execute(add_outcome_column_statement)
    db.session.commit()


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
        ensure_calls_outcome_column()
        get_or_create_office_hours_window()
        create_initial_manager(app)

    return app
