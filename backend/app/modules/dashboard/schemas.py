from pydantic import BaseModel, ConfigDict
from backend.app.modules.settings import OfficeHoursResponse


class AvgPerPersonPerDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    minutes: float


class VsYesterdayDelta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    minutes: float


class CallsByHourBlock(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    hours: list[int]
    outgoing: list[int]
    incoming: list[int]
    best_hour: int | None


class TalkTotals(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    outgoing_calls: int
    outgoing_minutes: float
    incoming_calls: int
    incoming_minutes: float
    outgoing_percent: int
    incoming_percent: int


class TopPersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    seconds: int
    minutes: float


class TeamPeriodBlock(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    seconds: int
    minutes: float
    connected_percent: int | None
    avg_per_person_per_day: AvgPerPersonPerDay
    vs_yesterday: VsYesterdayDelta | None
    calls_by_hour: CallsByHourBlock
    talk_totals: TalkTotals
    top_people: list[TopPersonSummary]


class TeamDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    today: TeamPeriodBlock
    yesterday: TeamPeriodBlock
    last_30_days: TeamPeriodBlock


class PeoplePeriodBlock(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    minutes: float


class TeamPeopleRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    name: str
    today: PeoplePeriodBlock
    yesterday: PeoplePeriodBlock


class AvgPerActiveDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    minutes: float


class TopNumberItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phone_number: str
    seconds: int
    minutes: float
    calls: int


class PersonPeriodStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    dials: int
    connected: int
    not_connected: int
    seconds: int
    minutes: float
    connected_percent: int | None
    calls_by_hour: CallsByHourBlock
    talk_totals: TalkTotals


class PersonThirtyDayStats(PersonPeriodStats):
    model_config = ConfigDict(from_attributes=True)
    active_days: int
    avg_per_active_day: AvgPerActiveDay | None


class PersonDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    office_hours: OfficeHoursResponse
    office_hours_label: str
    today: PersonPeriodStats
    yesterday: PersonPeriodStats
    last_30_days: PersonThirtyDayStats
    top_numbers: list[TopNumberItem]
