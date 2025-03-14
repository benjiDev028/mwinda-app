from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_code_service import send_reset_code_to_user, verify_code
from app.services.user_service import get_user_by_email, activate_user_email
from app.db.schemas.user import NotificationRequest, Generatecode
from app.db.session import connect_to_db, close_db_connection
from app.db.session import get_db
import asyncpg
import logging

# Configuration du logger
logger = logging.getLogger("activate_email")
logging.basicConfig(level=logging.INFO)

# Dépendance pour obtenir la session de base de données
async def get_db():
    db = await connect_to_db()
    try:
        yield db
    finally:
        await close_db_connection(db)

router = APIRouter(prefix="/identity", tags=["ActivateEmail"])

@router.post("/activate-email-step1")
async def activate_email_step1(user: Generatecode, db: asyncpg.Connection = Depends(get_db)):
    """
    Endpoint pour générer un code et l'envoyer à l'utilisateur.
    """
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email.")
        
        logger.info(f"Generating activation code for email: {user.email}")
        return await send_reset_code_to_user(db, user.email)
    
    except ValueError as e:
        logger.error(f"ValueError in activate_email_step1: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in activate_email_step1: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.post("/activate-email-step2")
async def activate_email_step2(user: NotificationRequest, db: asyncpg.Connection = Depends(get_db)):
    """
    Endpoint pour vérifier le code de l'utilisateur.
    """
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email.")
        
        logger.info(f"Verifying code for email: {user.email}")
        return await verify_code(db, user.email, user.code)
    
    except ValueError as e:
        logger.error(f"ValueError in activate_email_step2: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in activate_email_step2: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get("/activate-email-step3/{email}")
async def activate_email_step3(email:str , db: asyncpg.Connection = Depends(get_db)):
    """
    Endpoint pour activer l'email.
    """
    try:
        db_user = await get_user_by_email(db, email=email)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email.")
        
        logger.info(f"Activating email: {email}")
        return await activate_user_email(db, email)
    
    except ValueError as e:
        logger.error(f"ValueError in activate_email_step3: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in activate_email_step3: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
