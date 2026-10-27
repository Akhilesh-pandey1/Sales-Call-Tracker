import hmac
import logging
import os

from backend.app.core.errors import AppException

logger: logging.Logger = logging.getLogger(__name__)


def verify_manager_password(typed_password: str) -> None:
    wrong_password_status: int = 403
    service_unavailable_status: int = 503
    remove_password: str = os.getenv("DO_NOT_TRACK_REMOVE_PASSWORD", "")
    if not remove_password:
        raise AppException(
            "Removing is not available yet. Contact support.",
            service_unavailable_status,
        )
    typed_password_bytes: bytes = typed_password.encode("utf-8")
    remove_password_bytes: bytes = remove_password.encode("utf-8")
    passwords_match: bool = hmac.compare_digest(
        typed_password_bytes, remove_password_bytes
    )
    if not passwords_match:
        logger.warning("Refused a do-not-track removal: the password was wrong.")
        raise AppException(
            "Wrong password. Ask your manager.", wrong_password_status
        )
