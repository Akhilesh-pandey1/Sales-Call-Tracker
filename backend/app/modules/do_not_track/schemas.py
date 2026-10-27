from pydantic import BaseModel, field_validator

PASSWORD_REQUIRED_MESSAGE: str = "Password is required."


class VerifyRemovePasswordRequest(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def require_password(cls, value: str) -> str:
        trimmed_password: str = value.strip()
        if not trimmed_password:
            raise ValueError(PASSWORD_REQUIRED_MESSAGE)
        return value
