from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserRoleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: UserRole

    @field_validator("role")
    @classmethod
    def validate_assignable_role(cls, role: UserRole) -> UserRole:
        if role == UserRole.ADMIN:
            raise ValueError(
                "O perfil ADMIN não pode ser atribuído por este endpoint."
            )

        return role


class AdminUserResponse(UserResponse):
    is_current_user: bool


class UserRoleHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    target_user_id: int
    target_user_name: str | None
    admin_user_id: int
    admin_user_name: str | None
    previous_role: UserRole
    new_role: UserRole
    created_at: datetime