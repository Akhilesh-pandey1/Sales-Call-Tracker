from pydantic import BaseModel, field_validator


class VerifyRemovePasswordRequest(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def require_password(cls, value: str) -> str:
        if not value:
            raise ValueError("Password is required.")
        return value
