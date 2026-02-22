from fastapi import FastAPI
from app.api.endpoints.loyalty_routes import router as loyalty_router
from app.api.endpoints.history_routes import router as history_router
from fastapi.middleware.cors import CORSMiddleware


# Initialisation de l'application FastAPI
app = FastAPI(title="Loyalty System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permet l'accès depuis toutes les origines
    allow_credentials=True,
    allow_methods=["*"],  # Permet toutes les méthodes HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permet tous les headers
)

# Enregistrement des routes
app.include_router(loyalty_router, prefix="/loyalty", tags=["Loyalty"])
app.include_router(history_router, prefix="/history", tags=["History"])
