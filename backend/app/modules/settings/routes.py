from typing import Any
from flask import Blueprint, Response, g, jsonify, request
from pydantic import ValidationError
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.settings.schemas import (
    OfficeHoursResponse,
    UpdateOfficeHoursRequest,
)
from backend.app.modules.settings.services import (
    get_office_hours_view,
    update_office_hours_window,
)

settings_blueprint: Blueprint = Blueprint("settings", __name__, url_prefix="/settings")


def refuse_non_manager() -> None:
    forbidden_code: int = 403
    manager_role: str = "manager"
    if g.user.role != manager_role:
        raise AppException("This setting is for managers.", forbidden_code)


@settings_blueprint.get("/office-hours")
@require_auth
def get_office_hours() -> tuple[Response, int]:
    refuse_non_manager()

    ok_status: int = 200
    window_view: dict[str, str] = get_office_hours_view()
    validated_response: OfficeHoursResponse = OfficeHoursResponse.model_validate(
        window_view
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@settings_blueprint.put("/office-hours")
@require_auth
def update_office_hours() -> tuple[Response, int]:
    refuse_non_manager()

    bad_request_code: int = 400
    ok_status: int = 200
    raw_body: Any = request.get_json(silent=True)
    try:
        validated_request: UpdateOfficeHoursRequest = (
            UpdateOfficeHoursRequest.model_validate(raw_body)
        )
    except ValidationError:
        raise AppException(
            "Invalid request format: start_time and end_time required.",
            bad_request_code,
        )

    update_office_hours_window(validated_request.start_time, validated_request.end_time)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple
