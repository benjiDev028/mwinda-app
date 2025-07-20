from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_code_service import send_reset_code_to_user, verify_code
from app.services.user_service import get_user_by_email, activate_user_email
from app.db.schemas.user import NotificationRequest, Generatecode

from app.db.session import get_db
import asyncpg
import logging
from sqlalchemy.ext.asyncio import AsyncSession

# Configuration du logger
logger = logging.getLogger("activate_email")

logging.basicConfig(level=logging.INFO)



router = APIRouter(prefix="/identity", tags=["ActivateEmail"])

@router.post("/activate-email-step1")
async def activate_email_step1(user: Generatecode, db: AsyncSession = Depends(get_db)):
    """
    Endpoint pour générer un code et l'envoyer à l'utilisateur.
    """
    
    db_user = await get_user_by_email(db, email=user.email)
    return await send_reset_code_to_user(db, user.email)
    
   

@router.post("/activate-email-step2")
async def activate_email_step2(user: NotificationRequest, db: AsyncSession = Depends(get_db)):
    
   
    db_user = await get_user_by_email(db, email=user.email)      
    return await verify_code(db, user.email, user.code)
    
  
@router.get("/activate-email-step3/{email}")
async def activate_email_step3(email:str , db: AsyncSession = Depends(get_db)):
  
  
    db_user = await get_user_by_email(db, email=email)    
    return await activate_user_email(db, email)
