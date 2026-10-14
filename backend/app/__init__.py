import os
from flask import Flask
from backend.app.api import api_blueprint
from backend.app.commands import register_commands
from backend.app.config.base import BaseConfig
from backend.app.config.dev import DevConfig
from backend.app.config.prod import ProdConfig
from backend.app.core.errors import register_error_handlers
from backend.app.extensions import db


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
    register_error_handlers(app)
    app.register_blueprint(api_blueprint)
    register_commands(app)

    with app.app_context():
        db.create_all()

    return app
