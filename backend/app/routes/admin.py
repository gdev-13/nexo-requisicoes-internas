from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_admin
from app.models.user import User, UserRole
from app.schemas.user import AdminUserResponse, UserRoleUpdate

router = APIRouter(
    prefix="/admin",
    tags=["Administração"],
)


def build_admin_user_response(
    user: User,
    current_admin_id: int,
) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        updated_at=user.updated_at,
        is_current_user=user.id == current_admin_id,
    )


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
def list_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        build_admin_user_response(
            user=user,
            current_admin_id=current_admin.id,
        )
        for user in users
    ]


@router.patch(
    "/users/{user_id}/role",
    response_model=AdminUserResponse,
)
def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode alterar o próprio perfil.",
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="O perfil de um administrador não pode ser alterado.",
        )

    if user.role == role_data.role:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="O usuário já possui o perfil informado.",
        )

    user.role = role_data.role

    db.commit()
    db.refresh(user)

    return build_admin_user_response(
        user=user,
        current_admin_id=current_admin.id,
    )