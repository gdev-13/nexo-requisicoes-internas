from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.internal_request import RequestStatus


class RequestHistory(Base):
    __tablename__ = "request_histories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    request_id: Mapped[int] = mapped_column(
        ForeignKey("internal_requests.id"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    previous_status: Mapped[RequestStatus | None] = mapped_column(
        SqlEnum(RequestStatus),
        nullable=True,
    )

    new_status: Mapped[RequestStatus] = mapped_column(
        SqlEnum(RequestStatus),
        nullable=False,
    )

    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    request = relationship("InternalRequest")

    user = relationship("User")