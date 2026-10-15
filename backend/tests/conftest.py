import os
import sys

project_root: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from collections.abc import Generator
from flask import Flask
from flask.testing import FlaskClient
import pytest
from backend.app import create_app
from backend.app.config.base import BaseConfig
from backend.app.extensions import db


class TestConfig(BaseConfig):
    TESTING: bool = True
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///:memory:"


@pytest.fixture
def app() -> Generator[Flask, None, None]:
    application: Flask = create_app(TestConfig)
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    test_client: FlaskClient = app.test_client()
    return test_client
