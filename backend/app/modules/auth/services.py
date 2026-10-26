from datetime import datetime, timedelta, timezone
from backend.app.config.base import LOCKOUT_ATTEMPTS, LOCKOUT_MINUTES
from backend.app.core.errors import AppException
from backend.app.core.security import generate_auth_token, verify_password
from backend.app.extensions import db
from backend.app.modules.auth.models import Session
from backend.app.modules.auth.schemas import LoginRequest, LoginResponse
from backend.app.modules.users import User
from backend.app.modules.settings import get_office_hours_view

_failed_attempts: dict[str, int] = {}
_lockout_expirations: dict[str, datetime] = {}


def check_lockout(name: str) -> None:
    current_time: datetime = datetime.now(timezone.utc)
    locked_until: datetime | None = _lockout_expirations.get(name)

    if locked_until is not None:
        if current_time < locked_until:
            rate_limit_status: int = 429
            raise AppException(
                "Too many tries. Wait 5 minutes and try again.", rate_limit_status
            )
        del _lockout_expirations[name]
        zero_failures: int = 0
        _failed_attempts[name] = zero_failures


def record_failure(name: str) -> None:
    default_count: int = 0
    current_count: int = _failed_attempts.get(name, default_count)
    increment_step: int = 1
    new_count: int = current_count + increment_step
    _failed_attempts[name] = new_count

    if new_count >= LOCKOUT_ATTEMPTS:
        expiry_time: datetime = datetime.now(timezone.utc) + timedelta(
            minutes=LOCKOUT_MINUTES
        )
        _lockout_expirations[name] = expiry_time


def record_success(name: str) -> None:
    if name in _failed_attempts:
        del _failed_attempts[name]
    if name in _lockout_expirations:
        del _lockout_expirations[name]


def reset_lockout_state() -> None:
    _failed_attempts.clear()
    _lockout_expirations.clear()


def set_lockout_expiry(name: str, expiry_time: datetime) -> None:
    _lockout_expirations[name] = expiry_time


def authenticate_user(login_request: LoginRequest) -> LoginResponse:
    check_lockout(login_request.name)

    unauthorized_status: int = 401
    forbidden_status: int = 403

    user: User | None = User.query.filter_by(name=login_request.name).first()

    if user is None or not verify_password(
        user.password_hash, login_request.password
    ):
        record_failure(login_request.name)
        raise AppException("Wrong name or password.", unauthorized_status)

    if not user.is_active:
        record_success(login_request.name)
        raise AppException(
            "Your account is not active. Please contact your manager.",
            forbidden_status,
        )

    record_success(login_request.name)

    new_token: str = generate_auth_token()
    new_session: Session = Session(user_id=user.id, token=new_token)
    db.session.add(new_session)
    db.session.commit()

    current_office_hours: dict[str, str] = get_office_hours_view()

    login_response: LoginResponse = LoginResponse(
        token=new_token,
        id=user.id,
        role=user.role,
        name=user.name,
        country=user.country,
        office_hours=current_office_hours,
    )
    return login_response
