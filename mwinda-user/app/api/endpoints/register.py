from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import EmailStr
from asyncpg import Connection

from fastapi.security import OAuth2PasswordBearer
from app.db.schemas.user import UserCreate
from app.services.user_service import register_user, register_admin
import asyncpg
import logging
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_superadmin_user
import os
from app.db.schemas.user import UserCreate

# Configuration du logger
logger = logging.getLogger("register_endpoint")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)



router = APIRouter(prefix="/identity", tags=["Register"])



@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_endpoint(user: UserCreate, db: AsyncSession = Depends(get_db)):

  
        new_user = await register_user(db, user)       
        return new_user

   


@router.post("/register_admin", status_code=status.HTTP_201_CREATED)
async def register_endpoint(user: UserCreate, db: AsyncSession = Depends(get_db)):
    
        new_user = await register_admin(db, user)       
        return new_user

# @router.post("/register_admin", status_code=status.HTTP_201_CREATED)
# async def register_endpoint(
#     user: UserCreate,
#     db: AsyncSession = Depends(get_db),
#     current_user: dict = Depends(get_superadmin_user)
# ):
#     """
#     Register a new admin user (only accessible by superadmins)
#     """
#     try:
#         logger.info(f"Superadmin {current_user['user_id']} attempting to register admin with email: {user.email}")
       
#         # Vérification supplémentaire côté serveur
#         if current_user.get("role") != "superadmin":
#             logger.warning(f"Unauthorized attempt to register admin by user {current_user['user_id']}")
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Only superadmins can create admin accounts"
#             )
            
#         # Validation des données d'entrée
#         if not user.email or not user.password:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail={
#                     "error": "INVALID_INPUT",
#                     "message": "Email and password are required"
#                 }
#             )
            
#         new_user = await register_user_admin(db, user)
#         logger.info(f"Admin registered successfully by superadmin {current_user['user_id']}: {new_user.email}")
#         return new_user
        
#     except HTTPException as http_err:
#         logger.error(f"HTTP exception during admin registration: {http_err.detail}")
#         raise
#     except Exception as e:
#         logger.error(f"Unexpected error during admin registration: {e}")
#         logger.error(f"Exception type: {type(e).__name__}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail={
#                 "error": "INTERNAL_SERVER_ERROR",
#                 "message": f"An unexpected error occurred: {str(e)}"
#             }
#         )