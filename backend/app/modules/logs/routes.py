from flask import Blueprint, Response, g, request
from pydantic import ValidationError

from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth
from backend.app.modules.logs.schemas import DAY_ERROR_MESSAGE, TeamLogDownloadQuery
from backend.app.modules.logs.services import (
    ensure_manager_role,
    get_team_day_log_download,
)
from backend.app.modules.users import User

logs_blueprint: Blueprint = Blueprint("logs", __name__, url_prefix="/logs")


@logs_blueprint.get("/team")
@require_auth
def download_team_logs() -> tuple[Response, int]:
    bad_request_status: int = 400
    ok_status: int = 200

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
    csv_bytes: bytes = csv_text.encode("utf-8-sig")
    response: Response = Response(csv_bytes, mimetype="text/csv")
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple
