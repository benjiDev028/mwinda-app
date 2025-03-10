from fastapi import FastAPI
from app.api.endpoints import images
from app.db.database import init_db

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()

app.include_router(images.router, prefix="/images", tags=["images"])

@app.get("/")
def read_root():
    return {"message": "Service de gestion d'images en ligne"}
