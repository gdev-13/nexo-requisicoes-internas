from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import CORS_ORIGINS
from app.db.database import SessionLocal
from app.db.init_db import init_db
from app.routes import admin, auth, internal_request, request_type

app = FastAPI(
    title="Nexo API",
    description="API para gerenciamento de requisições internas",
    version="1.0.0",
)


origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()

app.include_router(auth.router)
app.include_router(request_type.router)
app.include_router(internal_request.router)
app.include_router(admin.router)


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