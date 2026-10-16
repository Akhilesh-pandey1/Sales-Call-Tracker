from pydantic import BaseModel, ConfigDict, field_validator


class PeriodStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    seconds: int


class PersonPeriodStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    seconds: int
    connected_percent: int | None


class HourlyCallBuckets(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    today: list[int]
    yesterday: list[int]
    last_30_days: list[int]

    @field_validator("today", "yesterday", "last_30_days")
    @classmethod
    def check_hour_bucket_count(cls, value: list[int]) -> list[int]:
        required_bucket_count: int = 24
        if len(value) != required_bucket_count:
            raise ValueError("Each period must carry exactly 24 hourly buckets.")
        return value


class TopPersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    seconds: int


class TopPeopleByPeriod(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    today: list[TopPersonSummary]
    yesterday: list[TopPersonSummary]
    last_30_days: list[TopPersonSummary]


class PersonDashboardSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    today: PeriodStats
    yesterday: PeriodStats


class TeamDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    today: PeriodStats
    yesterday: PeriodStats
    last_30_days: PeriodStats
    calls_by_hour: HourlyCallBuckets
    top_people: TopPeopleByPeriod
    people: list[PersonDashboardSummary]


class TopNumberItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phone_number: str
    seconds: int
    calls: int


class PersonDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    today: PersonPeriodStats
    yesterday: PersonPeriodStats
    last_30_days: PersonPeriodStats
    top_numbers: list[TopNumberItem]
