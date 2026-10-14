from typing import Any
from flask import Blueprint, Response, jsonify, request
from backend.app.core.errors import AppException
from backend.app.modules.auth.schemas import LoginRequest, LoginResponse
from backend.app.modules.auth.services import authenticate_user

auth_blueprint: Blueprint = Blueprint("auth", __name__)


@auth_blueprint.post("/login")
def login() -> tuple[Response, int]:
    bad_request_status: int = 400
    success_status: int = 200

    raw_data: Any = request.get_json(silent=True)
    if not isinstance(raw_data, dict):
        raise AppException("Name and password are required.", bad_request_status)

    name_value: Any = raw_data.get("name")
    password_value: Any = raw_data.get("password")

    if not isinstance(name_value, str) or not isinstance(password_value, str):
        raise AppException("Name and password are required.", bad_request_status)

    trimmed_name: str = name_value.strip()
    if not trimmed_name or not password_value.strip():
        raise AppException("Name and password are required.", bad_request_status)

    login_request: LoginRequest = LoginRequest(
        name=trimmed_name, password=password_value
    )
    login_result: LoginResponse = authenticate_user(login_request)
    response: Response = jsonify(login_result.model_dump())
    result_tuple: tuple[Response, int] = (response, success_status)
    return result_tuple
