from typing import Any
from flask import Flask, Response, jsonify
from werkzeug.exceptions import HTTPException


class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message: str = message
        self.status_code: int = status_code

    def to_dict(self) -> dict[str, str]:
        result: dict[str, str] = {"message": self.message}
        return result


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(AppException)
    def handle_app_exception(error: AppException) -> tuple[Response, int]:
        response: Response = jsonify(error.to_dict())
        status: int = error.status_code
        return response, status

    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException) -> tuple[Response, int]:
        error_code: int = error.code if error.code is not None else 500
        error_message: str = str(error.description)
        response: Response = jsonify({"message": error_message})
        return response, error_code

    @app.errorhandler(Exception)
    def handle_generic_exception(error: Exception) -> tuple[Response, int]:
        fallback_message: str = "An unexpected error occurred."
        response: Response = jsonify({"message": fallback_message})
        status: int = 500
        return response, status
