from typing import Any

from flask import Blueprint, Response, g, jsonify, request
from pydantic import ValidationError

from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.logs.schemas import (
    DAY_ERROR_MESSAGE,
    PersonLogRow,
    TeamLogDownloadQuery,
)
from backend.app.modules.logs.services import (
    ensure_manager_role,
    get_person_log_rows,
    get_person_thirty_day_log_download,
    get_team_day_log_download,
)
from backend.app.modules.users import User

logs_blueprint: Blueprint = Blueprint("logs", __name__, url_prefix="/logs")


def build_csv_download_response(csv_text: str, filename: str) -> tuple[Response, int]:
    ok_status: int = 200
    csv_bytes: bytes = csv_text.encode("utf-8-sig")
    response: Response = Response(csv_bytes, mimetype="text/csv")
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@logs_blueprint.get("/team")
@require_auth
def download_team_logs() -> tuple[Response, int]:
    bad_request_status: int = 400

    current_user: User = g.user
    ensure_manager_role(current_user)

    raw_query: dict[str, str | None] = {"day": request.args.get("day")}
    try:
        validated_query: TeamLogDownloadQuery = TeamLogDownloadQuery.model_validate(
            raw_query
        )
    except ValidationError:
        raise AppException(DAY_ERROR_MESSAGE, bad_request_status)

    csv_text, filename = get_team_day_log_download(validated_query.day)
    result_tuple: tuple[Response, int] = build_csv_download_response(
        csv_text, filename
    )
    return result_tuple


@logs_blueprint.get("/person/<int:user_id>")
@require_auth
def get_person_logs(user_id: int) -> tuple[Response, int]:
    ok_status: int = 200

    current_user: User = g.user
    ensure_manager_role(current_user)

    log_rows: list[dict[str, Any]] = get_person_log_rows(user_id)
    validated_rows: list[PersonLogRow] = [
        PersonLogRow.model_validate(log_row) for log_row in log_rows
    ]
    response_payload: list[dict[str, Any]] = [
        validated_row.model_dump() for validated_row in validated_rows
    ]
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@logs_blueprint.get("/person/<int:user_id>/download")
@require_auth
def download_person_logs(user_id: int) -> tuple[Response, int]:
    current_user: User = g.user
    ensure_manager_role(current_user)

    csv_text, filename = get_person_thirty_day_log_download(user_id)
    result_tuple: tuple[Response, int] = build_csv_download_response(
        csv_text, filename
    )
    return result_tuple
