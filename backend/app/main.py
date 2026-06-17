from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import Base, SessionLocal, engine
from app.routes import auth

app = FastAPI(
    title="Nexo API",
    description="API para gerenciamento de requisições internas",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)


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