from datetime import datetime, timedelta, timezone
from typing import Any
from flask import Response
from flask.testing import FlaskClient
from backend.app.core.security import hash_password
from backend.app.core.utils import now_ist
from backend.app.extensions import db
from backend.app.modules.calls import Call
from backend.app.modules.users import User


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
        auth_token=token,
    )
    db.session.add(user)
    db.session.commit()
    return user


def create_call_record(
    call_id: str,
    user_id: int,
    phone_number: str,
    dialed_at: datetime,
    duration_seconds: int = 0,
    direction: str = "outgoing",
) -> Call:
    call: Call = Call(
        call_id=call_id,
        user_id=user_id,
        phone_number=phone_number,
        dialed_at=dialed_at,
        duration_seconds=duration_seconds,
        direction=direction,
    )
    db.session.add(call)
    db.session.commit()
    return call


def create_call_records_bulk(
    call_rows: list[tuple[str, int, str, datetime, int]],
    direction: str = "outgoing",
) -> None:
    call_models: list[Call] = []
    for call_id, user_id, phone_number, dialed_at, duration_seconds in call_rows:
        call_models.append(
            Call(
                call_id=call_id,
                user_id=user_id,
                phone_number=phone_number,
                dialed_at=dialed_at,
                duration_seconds=duration_seconds,
                direction=direction,
            )
        )
    db.session.add_all(call_models)
    db.session.commit()


def create_utc_call_time(days_ago: int, hour_of_day: int) -> datetime:
    ist_today_midnight: datetime = now_ist().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    ist_call_time: datetime = ist_today_midnight - timedelta(
        days=days_ago
    ) + timedelta(hours=hour_of_day)
    utc_call_time: datetime = ist_call_time.astimezone(timezone.utc)
    return utc_call_time


def fetch_team_dashboard(
    client: FlaskClient, manager_token: str
) -> tuple[Response, dict[str, Any]]:
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response: Response = client.get("/api/dashboard/team", headers=headers)
    response_json: dict[str, Any] = response.get_json()
    return response, response_json


def fetch_team_people(
    client: FlaskClient, manager_token: str
) -> tuple[Response, list[dict[str, Any]]]:
    headers: dict[str, str] = {"Authorization": f"Bearer {manager_token}"}
    response: Response = client.get("/api/dashboard/team/people", headers=headers)
    response_json: list[dict[str, Any]] = response.get_json()
    return response, response_json


def fetch_person_dashboard(
    client: FlaskClient, auth_token: str, user_id: int
) -> tuple[Response, dict[str, Any]]:
    headers: dict[str, str] = {"Authorization": f"Bearer {auth_token}"}
    response: Response = client.get(
        f"/api/dashboard/person/{user_id}", headers=headers
    )
    response_json: dict[str, Any] = response.get_json()
    return response, response_json
