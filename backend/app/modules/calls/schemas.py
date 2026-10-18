from typing import Any, Literal, get_args
from pydantic import BaseModel

CallOutcome = Literal["connected", "not_connected", "schedule"]
VALID_CALL_OUTCOMES: list[str] = list(get_args(CallOutcome))


class SyncCallsRequest(BaseModel):
    calls: list[Any]


class SyncCallsResponse(BaseModel):
    status: bool


class RecordOutcomeRequest(BaseModel):
    outcome: CallOutcome
