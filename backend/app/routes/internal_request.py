from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.dependencies.auth import get_current_analyst, get_current_user
from app.models.internal_request import InternalRequest, RequestStatus
from app.models.request_type import RequestType
from app.models.user import User, UserRole
from app.schemas.internal_request import (
    InternalRequestCreate,
    InternalRequestResponse,
    RequestStatusAction,
)
from app.models.request_history import RequestHistory
from app.schemas.request_history import RequestHistoryResponse

router = APIRouter(prefix="/requests", tags=["Requisições Internas"])

def create_history(
    db: Session,
    internal_request: InternalRequest,
    user: User,
    previous_status: RequestStatus | None,
    new_status: RequestStatus,
    comment: str | None,
):
    request_history = RequestHistory(
        request_id=internal_request.id,
        user_id=user.id,
        previous_status=previous_status,
        new_status=new_status,
        comment=comment,
    )

    db.add(request_history)


def change_request_status(
    db: Session,
    internal_request: InternalRequest,
    user: User,
    new_status: RequestStatus,
    comment: str | None,
):
    previous_status = internal_request.status

    internal_request.status = new_status

    if new_status in {
        RequestStatus.RECUSADA,
        RequestStatus.CONCLUIDA,
        RequestStatus.CANCELADA,
    }:
        internal_request.closed_at = datetime.now(timezone.utc)

    create_history(
        db=db,
        internal_request=internal_request,
        user=user,
        previous_status=previous_status,
        new_status=new_status,
        comment=comment,
    )

    db.commit()
    db.refresh(internal_request)

    return internal_request


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

    create_history(
        db=db,
        internal_request=new_request,
        user=current_user,
        previous_status=None,
        new_status=new_request.status,
        comment="Requisição criada.",
    )

    db.commit()

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


@router.get("/history", response_model=list[RequestHistoryResponse])
def list_general_request_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(RequestHistory).options(
        joinedload(RequestHistory.request).joinedload(InternalRequest.request_type),
        joinedload(RequestHistory.user),
    )

    if current_user.role != UserRole.ANALYST:
        query = query.join(InternalRequest).filter(
            InternalRequest.requester_id == current_user.id,
        )

    return query.order_by(RequestHistory.created_at.desc()).all()


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


@router.get("/{request_id}/history", response_model=list[RequestHistoryResponse])
def list_request_history(
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
            detail="Você não tem permissão para acessar o histórico desta requisição.",
        )

    return (
        db.query(RequestHistory)
        .filter(RequestHistory.request_id == request_id)
        .order_by(RequestHistory.created_at.asc())
        .all()
    )


@router.patch(
    "/{request_id}/start-analysis",
    response_model=InternalRequestResponse,
)
def start_request_analysis(
    request_id: int,
    action_data: RequestStatusAction,
    current_user: User = Depends(get_current_analyst),
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

    if internal_request.status != RequestStatus.SOLICITADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas requisições solicitadas podem entrar em análise.",
        )

    return change_request_status(
        db=db,
        internal_request=internal_request,
        user=current_user,
        new_status=RequestStatus.EM_ANALISE,
        comment=action_data.comment or "Requisição colocada em análise.",
    )


@router.patch(
    "/{request_id}/approve",
    response_model=InternalRequestResponse,
)
def approve_request(
    request_id: int,
    action_data: RequestStatusAction,
    current_user: User = Depends(get_current_analyst),
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

    if internal_request.status != RequestStatus.EM_ANALISE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas requisições em análise podem ser aprovadas.",
        )

    return change_request_status(
        db=db,
        internal_request=internal_request,
        user=current_user,
        new_status=RequestStatus.APROVADA,
        comment=action_data.comment or "Requisição aprovada.",
    )


@router.patch(
    "/{request_id}/reject",
    response_model=InternalRequestResponse,
)
def reject_request(
    request_id: int,
    action_data: RequestStatusAction,
    current_user: User = Depends(get_current_analyst),
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

    if internal_request.status != RequestStatus.EM_ANALISE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas requisições em análise podem ser recusadas.",
        )

    if not action_data.comment or not action_data.comment.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informe uma justificativa para recusar a requisição.",
        )

    return change_request_status(
        db=db,
        internal_request=internal_request,
        user=current_user,
        new_status=RequestStatus.RECUSADA,
        comment=action_data.comment,
    )


@router.patch(
    "/{request_id}/conclude",
    response_model=InternalRequestResponse,
)
def conclude_request(
    request_id: int,
    action_data: RequestStatusAction,
    current_user: User = Depends(get_current_analyst),
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

    if internal_request.status != RequestStatus.APROVADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas requisições aprovadas podem ser concluídas.",
        )

    return change_request_status(
        db=db,
        internal_request=internal_request,
        user=current_user,
        new_status=RequestStatus.CONCLUIDA,
        comment=action_data.comment or "Requisição concluída.",
    )


@router.patch(
    "/{request_id}/cancel",
    response_model=InternalRequestResponse,
)
def cancel_request(
    request_id: int,
    action_data: RequestStatusAction,
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

    if internal_request.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você só pode cancelar suas próprias requisições.",
        )

    if internal_request.status != RequestStatus.SOLICITADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta requisição não pode mais ser cancelada.",
        )

    return change_request_status(
        db=db,
        internal_request=internal_request,
        user=current_user,
        new_status=RequestStatus.CANCELADA,
        comment=action_data.comment or "Requisição cancelada pelo solicitante.",
    )