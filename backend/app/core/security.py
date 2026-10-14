import secrets
from werkzeug.security import check_password_hash, generate_password_hash
from backend.app.config.base import PASSWORD_MIN_LENGTH


def hash_password(password: str) -> str:
    hashed_value: str = generate_password_hash(password)
    return hashed_value


def verify_password(stored_hash: str, password: str) -> bool:
    is_matching: bool = check_password_hash(stored_hash, password)
    return is_matching


def generate_auth_token() -> str:
    token_value: str = secrets.token_hex(32)
    return token_value


def validate_password_strength(password: str) -> bool:
    minimum_length: int = PASSWORD_MIN_LENGTH
    if len(password) < minimum_length:
        invalid_length: bool = False
        return invalid_length

    has_upper: bool = any(char.isupper() for char in password)
    has_lower: bool = any(char.islower() for char in password)
    
    is_valid: bool = has_upper and has_lower
    return is_valid
