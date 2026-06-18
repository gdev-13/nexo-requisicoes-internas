from app.db.database import Base, engine
from app.models.internal_request import InternalRequest
from app.models.request_history import RequestHistory
from app.models.request_type import RequestType
from app.models.user import User

_ = (InternalRequest, RequestHistory, RequestType, User)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)