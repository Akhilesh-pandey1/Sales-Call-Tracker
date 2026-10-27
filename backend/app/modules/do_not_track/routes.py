from typing import Any
from flask import Blueprint, Response, jsonify, request
from pydantic import ValidationError
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.do_not_track.schemas import (
    PASSWORD_REQUIRED_MESSAGE,
    VerifyRemovePasswordRequest,
)
from backend.app.modules.do_not_track.services import verify_manager_password

do_not_track_blueprint: Blueprint = Blueprint(
    "do_not_track", __name__, url_prefix="/do-not-track"
)


@do_not_track_blueprint.post("/verify-remove-password")
@require_auth
def verify_remove_password() -> tuple[Response, int]:
    bad_request_status: int = 400
    ok_status: int = 200

    raw_body: Any = request.get_json(silent=True)
    try:
        validated_request: VerifyRemovePasswordRequest = (
            VerifyRemovePasswordRequest.model_validate(raw_body)
        )
    except ValidationError:
        raise AppException(PASSWORD_REQUIRED_MESSAGE, bad_request_status)
    verify_manager_password(validated_request.password)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple
