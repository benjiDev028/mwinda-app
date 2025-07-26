from fastapi import FastAPI
from app.api.endpoints import register, auth, password, activateEmail, gestionUsers
from starlette.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.session import engine
from app.core.init_superadmin import create_superadmin

app = FastAPI(title="register System API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# STARTUP : Créer les tables et le superadmin

@app.on_event("startup")
async def startup_event():
    await create_superadmin()
    
# @app.on_event("startup")
# async def startup_event():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)


# Inclure les routers
app.include_router(register.router, tags=["Register"])
app.include_router(auth.router, tags=["Auth"])
app.include_router(activateEmail.router, tags=["ActivateEmail"])
app.include_router(password.router, tags=["Password"])
app.include_router(gestionUsers.router, tags=["GestionUsers"])
