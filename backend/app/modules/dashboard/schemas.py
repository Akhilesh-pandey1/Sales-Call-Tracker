from pydantic import BaseModel, ConfigDict


class AvgPerPersonPerDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    minutes: int


class VsYesterdayDelta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    minutes: int


class CallsByHourBlock(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    hours: list[int]
    dials: list[int]
    best_hour: int | None


class TopPersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    seconds: int
    minutes: int


class TeamPeriodBlock(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    seconds: int
    minutes: int
    connected_percent: int | None
    avg_per_person_per_day: AvgPerPersonPerDay
    vs_yesterday: VsYesterdayDelta | None
    calls_by_hour: CallsByHourBlock
    top_people: list[TopPersonSummary]


class TeamDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    today: TeamPeriodBlock
    yesterday: TeamPeriodBlock
    last_30_days: TeamPeriodBlock


class AvgPerActiveDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    minutes: int


class TopNumberItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phone_number: str
    seconds: int
    minutes: int
    calls: int


class PersonPeriodStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    seconds: int
    minutes: int
    connected_percent: int | None
    calls_by_hour: CallsByHourBlock


class PersonThirtyDayStats(PersonPeriodStats):
    model_config = ConfigDict(from_attributes=True)
    active_days: int
    avg_per_active_day: AvgPerActiveDay | None


class PersonDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    today: PersonPeriodStats
    yesterday: PersonPeriodStats
    last_30_days: PersonThirtyDayStats
    top_numbers: list[TopNumberItem]
