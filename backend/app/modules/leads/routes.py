from typing import Any
from flask import Blueprint, Response, g, jsonify, request
from pydantic import ValidationError
from werkzeug.datastructures import FileStorage
from backend.app.config.base import ALLOWED_COUNTRIES, MAX_LEAD_UPLOAD_MB
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_auth, require_manager
from backend.app.modules.leads.schemas import (
    LeadsSummaryResponse,
    NextLeadRequest,
    NextLeadResponse,
    ScheduleLeadRequest,
    UploadLeadsResponse,
)
from backend.app.modules.leads.services import (
    get_leads_summary,
    import_leads_csv,
    serve_next_lead,
)

leads_blueprint: Blueprint = Blueprint("leads", __name__, url_prefix="/leads")


@leads_blueprint.post("/upload")
@require_manager
def upload_leads() -> tuple[Response, int]:
    bad_request_code: int = 400
    success_code: int = 200

    if "file" not in request.files:
        raise AppException("Please select a valid CSV file.", bad_request_code)

    uploaded_file: FileStorage = request.files["file"]
    if not uploaded_file.filename:
        raise AppException("Please select a valid CSV file.", bad_request_code)

    csv_extension: str = ".csv"
    if not uploaded_file.filename.lower().endswith(csv_extension):
        raise AppException("Please select a valid CSV file.", bad_request_code)

    country_value: str = request.form.get("country", "").strip().upper()
    if country_value not in ALLOWED_COUNTRIES:
        allowed_countries_text: str = ", ".join(ALLOWED_COUNTRIES)
        raise AppException(
            f"Country must be one of: {allowed_countries_text}.", bad_request_code
        )

    file_bytes: bytes = uploaded_file.read()
    max_bytes: int = MAX_LEAD_UPLOAD_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise AppException("File is too large.", bad_request_code)

    result_data: dict[str, Any] = import_leads_csv(file_bytes, country_value)
    validated_response: UploadLeadsResponse = UploadLeadsResponse.model_validate(
        result_data
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, success_code)
    return result_tuple


@leads_blueprint.get("/summary")
@require_manager
def get_summary() -> tuple[Response, int]:
    success_code: int = 200
    summary_data: dict[str, Any] = get_leads_summary()
    validated_response: LeadsSummaryResponse = LeadsSummaryResponse.model_validate(
        summary_data
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, success_code)
    return result_tuple


@leads_blueprint.post("/next")
@require_auth
def get_next_lead() -> tuple[Response, int]:
    forbidden_code: int = 403
    bad_request_code: int = 400
    success_code: int = 200
    salesperson_role: str = "salesperson"

    if g.user.role != salesperson_role:
        raise AppException("Salesperson access required.", forbidden_code)

    raw_payload: Any = request.get_json(silent=True)
    payload_dict: dict[str, Any] = raw_payload if isinstance(raw_payload, dict) else {}

    try:
        validated_request: NextLeadRequest = NextLeadRequest.model_validate(
            payload_dict
        )
    except ValidationError:
        raise AppException(
            "Scheduled time must be in the future within 30 days.", bad_request_code
        )

    user_id: int = g.user.id
    schedule_model: ScheduleLeadRequest | None = validated_request.schedule
    served_result: dict[str, Any] = serve_next_lead(user_id, schedule_model)
    validated_response: NextLeadResponse = NextLeadResponse.model_validate(
        served_result
    )
    response: Response = jsonify(validated_response.model_dump())
    result_tuple: tuple[Response, int] = (response, success_code)
    return result_tuple
