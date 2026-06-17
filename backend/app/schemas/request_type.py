from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RequestTypeCreate(BaseModel):
    name: str = Field(min_length=3, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class RequestTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class RequestTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    active: bool
    created_at: datetime
    updated_at: datetime