from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import EmailStr
from asyncpg import Connection
from app.db.session import connect_to_db, close_db_connection
from fastapi.security import OAuth2PasswordBearer
from app.db.schemas.user import UserCreate
from app.services.user_service import register_user,register_user_admin
import asyncpg
import logging


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

# Dépendance pour obtenir la session de base de données
async def get_db():
    db = await connect_to_db()
    try:
        yield db
    finally:
        await close_db_connection(db)

router = APIRouter(prefix="/identity", tags=["Register"])

# Configuration du secret JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_endpoint(user: UserCreate, db: asyncpg.Connection = Depends(get_db)):
    """
    Inscrire un nouvel utilisateur.
    """
    try:
        logger.info(f"Attempting to register user with email: {user.email}")
        new_user = await register_user(db, user)
        logger.info(f"User registered successfully with email: {new_user.email}")
        return new_user

    except ValueError as e:
        logger.warning(f"Validation error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={"error": "VALIDATION_ERROR", "message": str(e)}
        )
    except HTTPException as http_err:
        logger.error(f"HTTP exception: {http_err.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during user registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during registration. Please try again later."
            }
        )


# @router.post("/register_admin", status_code=status.HTTP_201_CREATED)
# async def register_endpoint(user: UserCreate, db: asyncpg.Connection = Depends(get_db)):
#     """
#     Inscrire un nouvel utilisateur.
#     """
#     try:
#         logger.info(f"Attempting to register user with email: {user.email}")
#         new_user = await register_user_admin(db, user)
#         logger.info(f"User registered successfully with email: {new_user.email}")
#         return new_user

#     except ValueError as e:
#         logger.warning(f"Validation error during registration: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, 
#             detail={"error": "VALIDATION_ERROR", "message": str(e)}
#         )
#     except HTTPException as http_err:
#         logger.error(f"HTTP exception: {http_err.detail}")
#         raise
#     except Exception as e:
#         logger.error(f"Unexpected error during user registration: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail={
#                 "error": "INTERNAL_SERVER_ERROR",
#                 "message": "An unexpected error occurred during registration. Please try again later."
#             }
#         )
@router.post("/register_admin", status_code=status.HTTP_201_CREATED)
async def register_endpoint(
    user: UserCreate,
    db: asyncpg.Connection = Depends(get_db),
    current_user: dict = Depends(get_superadmin_user)
):
    """
    Register a new admin user (only accessible by superadmins)
    """
    try:
        logger.info(f"Superadmin {current_user['user_id']} attempting to register admin with email: {user.email}")
       
        # Vérification supplémentaire côté serveur
        if current_user.get("role") != "superadmin":
            logger.warning(f"Unauthorized attempt to register admin by user {current_user['user_id']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only superadmins can create admin accounts"
            )
            
        # Validation des données d'entrée
        if not user.email or not user.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "INVALID_INPUT",
                    "message": "Email and password are required"
                }
            )
            
        new_user = await register_user_admin(db, user)
        logger.info(f"Admin registered successfully by superadmin {current_user['user_id']}: {new_user.email}")
        return new_user
        
    except HTTPException as http_err:
        logger.error(f"HTTP exception during admin registration: {http_err.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during admin registration: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": f"An unexpected error occurred: {str(e)}"
            }
        )