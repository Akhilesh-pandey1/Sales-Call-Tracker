from typing import Any
from flask import Blueprint, Response, g, jsonify
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.dashboard.schemas import (
    PersonDashboardResponse,
    TeamDashboardResponse,
)
from backend.app.modules.dashboard.services import (
    get_person_dashboard_data,
    get_team_dashboard_data,
)

dashboard_blueprint: Blueprint = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_blueprint.get("/team")
@require_auth
def get_team_dashboard() -> tuple[Response, int]:
    forbidden_code: int = 403
    manager_role: str = "manager"
    if g.user.role != manager_role:
        raise AppException("This dashboard is for managers.", forbidden_code)

    ok_status: int = 200
    team_data: dict[str, Any] = get_team_dashboard_data()
    validated_response: TeamDashboardResponse = TeamDashboardResponse.model_validate(
        team_data
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, ok_status)
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
