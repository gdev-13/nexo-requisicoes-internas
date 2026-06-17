from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_analyst, get_current_user
from app.models.internal_request import InternalRequest
from app.models.request_type import RequestType
from app.models.user import User, UserRole
from app.schemas.internal_request import (
    InternalRequestCreate,
    InternalRequestResponse,
)

router = APIRouter(prefix="/requests", tags=["Requisições Internas"])


@router.post(
    "",
    response_model=InternalRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_internal_request(
    request_data: InternalRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request_type = (
        db.query(RequestType)
        .filter(
            RequestType.id == request_data.request_type_id,
            RequestType.active.is_(True),
        )
        .first()
    )

    if not request_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de requisição não encontrado ou inativo.",
        )

    new_request = InternalRequest(
        title=request_data.title,
        description=request_data.description,
        priority=request_data.priority,
        request_type_id=request_data.request_type_id,
        requester_id=current_user.id,
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/my", response_model=list[InternalRequestResponse])
def list_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(InternalRequest)
        .filter(InternalRequest.requester_id == current_user.id)
        .order_by(InternalRequest.created_at.desc())
        .all()
    )


@router.get(
    "",
    response_model=list[InternalRequestResponse],
    dependencies=[Depends(get_current_analyst)],
)
def list_all_requests(db: Session = Depends(get_db)):
    return (
        db.query(InternalRequest)
        .order_by(InternalRequest.created_at.desc())
        .all()
    )


@router.get("/{request_id}", response_model=InternalRequestResponse)
def get_request_by_id(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    internal_request = (
        db.query(InternalRequest)
        .filter(InternalRequest.id == request_id)
        .first()
    )

    if not internal_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisição não encontrada.",
        )

    is_owner = internal_request.requester_id == current_user.id
    is_analyst = current_user.role == UserRole.ANALYST

    if not is_owner and not is_analyst:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta requisição.",
        )

    return internal_request