from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class RequestStatus(str, Enum):
    SOLICITADA = "SOLICITADA"
    EM_ANALISE = "EM_ANALISE"
    APROVADA = "APROVADA"
    RECUSADA = "RECUSADA"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"


class RequestPriority(str, Enum):
    BAIXA = "BAIXA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    URGENTE = "URGENTE"


class InternalRequest(Base):
    __tablename__ = "internal_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(120), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[RequestStatus] = mapped_column(
        SqlEnum(RequestStatus),
        default=RequestStatus.SOLICITADA,
        nullable=False,
    )

    priority: Mapped[RequestPriority] = mapped_column(
        SqlEnum(RequestPriority),
        default=RequestPriority.MEDIA,
        nullable=False,
    )

    requester_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    request_type_id: Mapped[int] = mapped_column(
        ForeignKey("request_types.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    requester = relationship("User")

    request_type = relationship("RequestType")

    @property
    def request_type_name(self) -> str | None:
        if not self.request_type:
            return None

        return self.request_type.name