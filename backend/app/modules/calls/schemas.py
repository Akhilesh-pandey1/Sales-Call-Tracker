from typing import Any
from pydantic import BaseModel


class SyncCallsRequest(BaseModel):
    calls: list[Any]


class SyncCallsResponse(BaseModel):
    status: bool
    schedule_refused_call_ids: list[str] = []
