from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    name: str
    role: str
    country: str
    is_active: bool


class CreateUserRequest(BaseModel):
    name: str
    password: str
    country: str


class UpdateUserRequest(BaseModel):
    name: str | None = None
    password: str | None = None
    country: str | None = None
