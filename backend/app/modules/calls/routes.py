from typing import Any
from flask import Blueprint, Response, g, jsonify, request
from pydantic import ValidationError
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.calls.schemas import SyncCallsRequest
from backend.app.modules.calls.services import sync_calls_batch

calls_blueprint: Blueprint = Blueprint("calls", __name__, url_prefix="/calls")


@calls_blueprint.route("/sync", methods=["POST"])
@require_auth
def sync_calls() -> tuple[Response, int]:
    bad_request_code: int = 400
    success_code: int = 200

    request_data: Any = request.get_json(silent=True)
    if not isinstance(request_data, dict):
        raise AppException("A list of calls is required.", bad_request_code)

    try:
        validated_request: SyncCallsRequest = SyncCallsRequest.model_validate(
            request_data
        )
    except ValidationError:
        raise AppException("A list of calls is required.", bad_request_code)

    current_user_id: int = g.user.id
    current_user_country: str = g.user.country
    result: dict[str, Any] = sync_calls_batch(
        validated_request.calls, current_user_id, current_user_country
    )

    response: Response = jsonify(result)
    return response, success_code
