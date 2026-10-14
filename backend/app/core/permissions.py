from collections.abc import Callable
from functools import wraps
from typing import Any
from flask import g, request
from backend.app.core.errors import AppException
from backend.app.modules.users import User


def require_auth(endpoint_handler: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(endpoint_handler)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        unauthorized_code: int = 401
        forbidden_code: int = 403

        auth_header: str | None = request.headers.get("Authorization")
        prefix: str = "Bearer "
        token_value: str = ""

        if auth_header is not None and auth_header.startswith(prefix):
            token_value = auth_header.removeprefix(prefix).strip()

        if not token_value:
            raise AppException("Invalid or expired token.", unauthorized_code)

        user: User | None = User.query.filter_by(auth_token=token_value).first()
        if user is None:
            raise AppException("Invalid or expired token.", unauthorized_code)

        if not user.is_active:
            raise AppException(
                "Your account is not active. Please contact your manager.",
                forbidden_code,
            )

        g.user = user
        handler_result: Any = endpoint_handler(*args, **kwargs)
        return handler_result

    result_function: Callable[..., Any] = decorated_function
    return result_function
