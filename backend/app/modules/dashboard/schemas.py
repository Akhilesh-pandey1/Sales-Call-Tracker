from pydantic import BaseModel, ConfigDict


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
    people: list[PersonDashboardSummary]


class TopNumberItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phone_number: str
    seconds: int
    calls: int


class PersonThirtyDayStats(PersonPeriodStats):
    model_config = ConfigDict(from_attributes=True)
    active_days: int


class PersonDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    today: PersonPeriodStats
    yesterday: PersonPeriodStats
    last_30_days: PersonThirtyDayStats
    top_numbers: list[TopNumberItem]
