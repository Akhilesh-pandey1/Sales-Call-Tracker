from typing import Any
from flask import Blueprint, Response, g, jsonify, request
from backend.app.config.base import ALLOWED_COUNTRIES
from backend.app.core.errors import AppException
from backend.app.core.permissions import require_manager
from backend.app.modules.users.schemas import (
    CreateUserRequest,
    UpdateUserRequest,
    UserResponse,
)
from backend.app.modules.users.services import (
    activate_user_account,
    create_new_user,
    deactivate_user_account,
    delete_user_account,
    list_all_users,
    update_user_account,
)

users_blueprint: Blueprint = Blueprint("users", __name__, url_prefix="/users")


@users_blueprint.get("")
@require_manager
def get_users() -> tuple[Response, int]:
    ok_status: int = 200
    user_records: list[UserResponse] = list_all_users()
    response_payload: list[dict[str, object]] = [
        record.model_dump() for record in user_records
    ]
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@users_blueprint.post("")
@require_manager
def create_user() -> tuple[Response, int]:
    bad_request_code: int = 400
    created_code: int = 201

    raw_data: Any = request.get_json(silent=True)
    if not isinstance(raw_data, dict):
        raise AppException("Name and password are required.", bad_request_code)

    name_value: Any = raw_data.get("name")
    password_value: Any = raw_data.get("password")
    country_value: Any = raw_data.get("country")

    if not isinstance(name_value, str) or not isinstance(password_value, str):
        raise AppException("Name and password are required.", bad_request_code)

    trimmed_name: str = name_value.strip()
    if not trimmed_name or not password_value:
        raise AppException("Name and password are required.", bad_request_code)

    if not isinstance(country_value, str) or country_value.strip() not in ALLOWED_COUNTRIES:
        raise AppException("Country must be one of: IN, AE, US.", bad_request_code)

    create_request: CreateUserRequest = CreateUserRequest(
        name=trimmed_name,
        password=password_value,
        country=country_value.strip(),
    )
    create_new_user(create_request)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, created_code)
    return result_tuple


@users_blueprint.post("/<int:user_id>/update")
@require_manager
def update_user(user_id: int) -> tuple[Response, int]:
    ok_status: int = 200
    bad_request_code: int = 400

    raw_data: Any = request.get_json(silent=True)
    if not isinstance(raw_data, dict):
        raise AppException("Invalid request body.", bad_request_code)

    name_value: Any = raw_data.get("name")
    password_value: Any = raw_data.get("password")
    country_value: Any = raw_data.get("country")

    if name_value is None and password_value is None and country_value is None:
        raise AppException("At least one field is required to update.", bad_request_code)

    parsed_name: str | None = None
    if name_value is not None:
        if not isinstance(name_value, str):
            raise AppException("Invalid name.", bad_request_code)
        parsed_name = name_value.strip()

    parsed_password: str | None = None
    if password_value is not None:
        if not isinstance(password_value, str):
            raise AppException("Invalid password.", bad_request_code)
        parsed_password = password_value

    parsed_country: str | None = None
    if country_value is not None:
        if not isinstance(country_value, str):
            raise AppException("Country must be one of: IN, AE, US.", bad_request_code)
        parsed_country = country_value.strip()

    update_request: UpdateUserRequest = UpdateUserRequest(
        name=parsed_name,
        password=parsed_password,
        country=parsed_country,
    )
    update_user_account(user_id, update_request)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@users_blueprint.post("/<int:user_id>/deactivate")
@require_manager
def deactivate_user(user_id: int) -> tuple[Response, int]:
    ok_status: int = 200
    current_manager_id: int = g.user.id
    deactivate_user_account(user_id, current_manager_id)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@users_blueprint.post("/<int:user_id>/activate")
@require_manager
def activate_user(user_id: int) -> tuple[Response, int]:
    ok_status: int = 200
    activate_user_account(user_id)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple


@users_blueprint.delete("/<int:user_id>")
@require_manager
def delete_user(user_id: int) -> tuple[Response, int]:
    ok_status: int = 200
    current_manager_id: int = g.user.id
    delete_user_account(user_id, current_manager_id)

    response_payload: dict[str, bool] = {"status": True}
    response: Response = jsonify(response_payload)
    result_tuple: tuple[Response, int] = (response, ok_status)
    return result_tuple
