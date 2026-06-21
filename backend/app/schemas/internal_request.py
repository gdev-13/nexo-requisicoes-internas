from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.internal_request import RequestPriority, RequestStatus


class InternalRequestCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=2000)
    priority: RequestPriority = RequestPriority.MEDIA
    request_type_id: int


class InternalRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: RequestStatus
    priority: RequestPriority
    requester_id: int
    requester_name: str | None = None
    request_type_id: int
    request_type_name: str | None = None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None


class RequestStatusAction(BaseModel):
    comment: str | None = Field(default=None, max_length=500)