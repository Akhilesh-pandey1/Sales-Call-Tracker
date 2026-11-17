from pydantic import BaseModel, field_validator

DAY_ERROR_MESSAGE: str = "day must be today or yesterday."


class TeamLogDownloadQuery(BaseModel):
    day: str

    @field_validator("day")
    @classmethod
    def require_known_day(cls, value: str) -> str:
        today_option: str = "today"
        yesterday_option: str = "yesterday"
        if value not in (today_option, yesterday_option):
            raise ValueError(DAY_ERROR_MESSAGE)
        return value
