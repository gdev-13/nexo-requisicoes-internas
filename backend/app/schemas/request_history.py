from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.internal_request import RequestStatus


class RequestHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    user_id: int
    previous_status: RequestStatus | None
    new_status: RequestStatus
    comment: str | None
    created_at: datetime