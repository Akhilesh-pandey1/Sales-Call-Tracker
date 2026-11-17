from typing import Any
from flask import Blueprint, Response, g, jsonify
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth, require_dashboard_manager
from backend.app.modules.dashboard.schemas import (
    DailyRow,
    PersonDashboardResponse,
    TeamDashboardResponse,
    TeamPeopleRow,
)
from backend.app.modules.dashboard.person_services import (
    get_person_daily_data,
    get_person_dashboard_data,
)
from backend.app.modules.dashboard.services import (
    get_team_daily_data,
    get_team_dashboard_data,
    get_team_people_data,
)
from backend.app.modules.users import User

dashboard_blueprint: Blueprint = Blueprint("dashboard", __name__, url_prefix="/dashboard")


def build_daily_response(daily_rows: list[dict[str, Any]]) -> tuple[Response, int]:
    ok_status: int = 200
    validated_rows: list[DailyRow] = [
        DailyRow.model_validate(row) for row in daily_rows
    ]
    response_payload: list[dict[str, Any]] = [
        validated_row.model_dump() for validated_row in validated_rows
    ]
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@dashboard_blueprint.get("/team")
@require_dashboard_manager
def get_team_dashboard() -> tuple[Response, int]:
    ok_status: int = 200
    team_data: dict[str, Any] = get_team_dashboard_data()
    validated_response: TeamDashboardResponse = TeamDashboardResponse.model_validate(
        team_data
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@dashboard_blueprint.get("/team/people")
@require_dashboard_manager
def get_team_people() -> tuple[Response, int]:
    ok_status: int = 200
    people_rows: list[dict[str, Any]] = get_team_people_data()
    validated_rows: list[TeamPeopleRow] = [
        TeamPeopleRow.model_validate(row) for row in people_rows
    ]
    response_payload: list[dict[str, Any]] = [
        validated_row.model_dump() for validated_row in validated_rows
    ]
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@dashboard_blueprint.get("/team/daily")
@require_dashboard_manager
def get_team_daily() -> tuple[Response, int]:
    daily_rows: list[dict[str, Any]] = get_team_daily_data()
    result_tuple: tuple[Response, int] = build_daily_response(daily_rows)
    return result_tuple


@dashboard_blueprint.get("/person/<int:user_id>")
@require_auth
def get_person_dashboard(user_id: int) -> tuple[Response, int]:
    forbidden_code: int = 403
    manager_role: str = "manager"

    if g.user.role != manager_role and g.user.id != user_id:
        raise AppException(
            "Access denied: you can only view your own statistics.", forbidden_code
        )

    ok_status: int = 200
    person_data: dict[str, Any] = get_person_dashboard_data(user_id)
    validated_response: PersonDashboardResponse = (
        PersonDashboardResponse.model_validate(person_data)
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@dashboard_blueprint.get("/person/<int:user_id>/daily")
@require_dashboard_manager
def get_person_daily(user_id: int) -> tuple[Response, int]:
    daily_rows: list[dict[str, Any]] = get_person_daily_data(user_id)
    result_tuple: tuple[Response, int] = build_daily_response(daily_rows)
    return result_tuple
