from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    name: str
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        trimmed: str = value.strip()
        if not trimmed:
            raise ValueError("Name cannot be blank")
        return trimmed

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value:
            raise ValueError("Password cannot be blank")
        return value


class LoginResponse(BaseModel):
    token: str
    id: int
    role: str
    name: str
    country: str
