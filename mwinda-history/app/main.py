from fastapi import FastAPI
from app.api.endpoints import loyalty_history
from app.db.database import engine, Base

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservice Historique")

# Inclusion des routes
app.include_router(loyalty_history.router)
