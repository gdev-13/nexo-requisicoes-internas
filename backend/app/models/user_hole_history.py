from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.user import User, UserRole


class UserRoleHistory(Base):
    __tablename__ = "user_role_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    target_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    admin_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    previous_role: Mapped[UserRole] = mapped_column(
        SqlEnum(UserRole),
        nullable=False,
    )

    new_role: Mapped[UserRole] = mapped_column(
        SqlEnum(UserRole),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    target_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[target_user_id],
    )

    admin_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[admin_user_id],
    )

    @property
    def target_user_name(self) -> str | None:
        if not self.target_user:
            return None

        return self.target_user.name

    @property
    def admin_user_name(self) -> str | None:
        if not self.admin_user:
            return None

        return self.admin_user.name