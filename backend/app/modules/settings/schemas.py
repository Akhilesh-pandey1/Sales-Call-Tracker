import re
from pydantic import BaseModel, field_validator


class OfficeHoursResponse(BaseModel):
    start_time: str
    end_time: str


class UpdateOfficeHoursRequest(BaseModel):
    start_time: str
    end_time: str

    @field_validator("start_time", "end_time")
    @classmethod
    def require_hhmm_format(cls, value: str) -> str:
        hhmm_pattern: str = r"([01]\d|2[0-3]):[0-5]\d"
        if re.fullmatch(hhmm_pattern, value) is None:
            raise ValueError("Time must be in HH:MM format.")
        return value
