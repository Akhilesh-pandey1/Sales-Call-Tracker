from pydantic import BaseModel, field_validator

DAY_ERROR_MESSAGE: str = "day must be today or yesterday."


def ensure_known_day_name(value: str) -> str:
    today_option: str = "today"
    yesterday_option: str = "yesterday"
    if value not in (today_option, yesterday_option):
        raise ValueError(DAY_ERROR_MESSAGE)
    return value


class TeamLogDownloadQuery(BaseModel):
    day: str

    @field_validator("day")
    @classmethod
    def require_known_day(cls, value: str) -> str:
        validated_day: str = ensure_known_day_name(value)
        return validated_day


class PersonLogDownloadQuery(BaseModel):
    day: str | None = None

    @field_validator("day")
    @classmethod
    def require_known_day(cls, value: str | None) -> str | None:
        if value is None:
            return value
        validated_day: str = ensure_known_day_name(value)
        return validated_day


class PersonLogRow(BaseModel):
    phone_number: str
    date: str
    time: str
    direction: str
    connected: bool
    minutes: float
