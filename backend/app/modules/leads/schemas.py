from pydantic import BaseModel


class UploadLeadsResponse(BaseModel):
    status: bool
    added: int
    duplicates: int
    invalid: int


class LeadPoolBucketCounts(BaseModel):
    waiting: int
    waiting_by_attempts: dict[str, int]
    scheduled: int
    connected: int
    stopped: int


class DayCounts(BaseModel):
    today: int
    yesterday: int


class LeadsSummaryResponse(BaseModel):
    status: bool
    pool: LeadPoolBucketCounts
    uploaded: DayCounts
    tackled: DayCounts


class ScheduleLeadRequest(BaseModel):
    lead_id: int
    scheduled_at: str


class NextLeadRequest(BaseModel):
    schedule: ScheduleLeadRequest | None = None


class ServedLead(BaseModel):
    id: int
    phone_number: str
    attempt_count: int
    is_scheduled: bool


class NextLeadResponse(BaseModel):
    status: bool
    lead: ServedLead | None = None
