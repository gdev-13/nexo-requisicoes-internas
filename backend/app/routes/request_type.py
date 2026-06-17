from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_analyst, get_current_user
from app.models.request_type import RequestType
from app.schemas.request_type import (
    RequestTypeCreate,
    RequestTypeResponse,
    RequestTypeUpdate,
)

router = APIRouter(prefix="/request-types", tags=["Tipos de Requisição"])


@router.get(
    "",
    response_model=list[RequestTypeResponse],
    dependencies=[Depends(get_current_user)],
)
def list_request_types(db: Session = Depends(get_db)):
    return db.query(RequestType).filter(RequestType.active.is_(True)).all()


@router.get(
    "/all",
    response_model=list[RequestTypeResponse],
    dependencies=[Depends(get_current_analyst)],
)
def list_all_request_types(db: Session = Depends(get_db)):
    return db.query(RequestType).all()

@router.post(
    "",
    response_model=RequestTypeResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_analyst)],
)
def create_request_type(
    request_type_data: RequestTypeCreate,
    db: Session = Depends(get_db),
):
    existing_type = (
        db.query(RequestType)
        .filter(RequestType.name == request_type_data.name)
        .first()
    )

    if existing_type:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tipo de requisição já cadastrado.",
        )

    new_request_type = RequestType(
        name=request_type_data.name,
        description=request_type_data.description,
    )

    db.add(new_request_type)
    db.commit()
    db.refresh(new_request_type)

    return new_request_type


@router.put(
    "/{request_type_id}",
    response_model=RequestTypeResponse,
    dependencies=[Depends(get_current_analyst)],
)
def update_request_type(
    request_type_id: int,
    request_type_data: RequestTypeUpdate,
    db: Session = Depends(get_db),
):
    request_type = (
        db.query(RequestType)
        .filter(RequestType.id == request_type_id)
        .first()
    )

    if not request_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de requisição não encontrado.",
        )

    if request_type_data.name is not None:
        existing_type = (
            db.query(RequestType)
            .filter(
                RequestType.name == request_type_data.name,
                RequestType.id != request_type_id,
            )
            .first()
        )

        if existing_type:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Já existe outro tipo de requisição com esse nome.",
            )

        request_type.name = request_type_data.name

    if request_type_data.description is not None:
        request_type.description = request_type_data.description

    db.commit()
    db.refresh(request_type)

    return request_type


@router.patch(
    "/{request_type_id}/disable",
    response_model=RequestTypeResponse,
    dependencies=[Depends(get_current_analyst)],
)
def disable_request_type(
    request_type_id: int,
    db: Session = Depends(get_db),
):
    request_type = (
        db.query(RequestType)
        .filter(RequestType.id == request_type_id)
        .first()
    )

    if not request_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de requisição não encontrado.",
        )

    request_type.active = False

    db.commit()
    db.refresh(request_type)

    return request_type


@router.patch(
    "/{request_type_id}/enable",
    response_model=RequestTypeResponse,
    dependencies=[Depends(get_current_analyst)],
)
def enable_request_type(
    request_type_id: int,
    db: Session = Depends(get_db),
):
    request_type = (
        db.query(RequestType)
        .filter(RequestType.id == request_type_id)
        .first()
    )

    if not request_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de requisição não encontrado.",
        )

    request_type.active = True

    db.commit()
    db.refresh(request_type)

    return request_type