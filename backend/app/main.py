from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import SessionLocal
from app.db.init_db import init_db
from app.routes import auth, internal_request, request_type

app = FastAPI(
    title="Nexo API",
    description="API para gerenciamento de requisições internas",
    version="1.0.0",
)

init_db()

app.include_router(auth.router)
app.include_router(request_type.router)
app.include_router(internal_request.router)


@app.get("/")
def root():
    return {"message": "API do Nexo está funcionando"}


@app.get("/health/db")
def check_database():
    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected"}
    finally:
        db.close()