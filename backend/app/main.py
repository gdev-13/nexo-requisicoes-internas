from fastapi import FastAPI

app = FastAPI(
    title="Nexo API",
    description="API para gerenciamento de requisições internas",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"message": "API do Nexo está funcionando"}