from fastapi import APIRouter, Depends, HTTPException
from app.services.user_service import update_user_password, get_userv1_by_email, reset_password_request , get_user_by_email
from app.services.user_code_service import send_reset_code_to_user, verify_code
from app.db.schemas.password import PasswordUpdate, ResetPasswordRequest, CodeResetPasswordRequest, UpdatePasswordRequest
from app.db.session import connect_to_db, close_db_connection
from app.core.security import verify_password, get_password_hash
from app.db.session import get_db
import asyncpg
import logging

# Configuration du logger
logger = logging.getLogger("password_endpoints")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Dépendance pour obtenir la session de base de données
async def get_db():
    db = await connect_to_db()
    try:
        yield db
    finally:
        await close_db_connection(db)

router = APIRouter(prefix="/identity", tags=["Password"])

"""
Mettre a jour un mot de passe parametres : (Email , old_mdp , new_mdp)
"""

@router.put("/update-password")
async def update_password_endpoint(
    user: PasswordUpdate, db: asyncpg.Connection = Depends(get_db)
):
    """
    Endpoint pour mettre à jour le mot de passe.
    """
    try:
        db_user = await get_userv1_by_email(db, email=user.email)
        if not db_user or not verify_password(user.old_password, db_user["password_hash"], db_user["password_salt"]):
            logger.warning(f"Tentative de mise à jour de mot de passe échouée pour l'email: {user.email}")
            raise HTTPException(status_code=400, detail="Invalid credentials")

        new_hashed_password, salt = get_password_hash(user.new_password)
        result = await update_user_password(db, user_id=db_user["id"], new_password=new_hashed_password, salt=salt)
        logger.info(f"Mot de passe mis à jour avec succès pour l'utilisateur: {user.email}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du mot de passe pour {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/reset-password-step1")
async def reset_password_endpoint(
    user: ResetPasswordRequest, db: asyncpg.Connection = Depends(get_db)
):
    """
    EndPoint pour Envoyer le code via mail
    """
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if not db_user:
            logger.warning(f"Tentative de réinitialisation échouée: email invalide {user.email}")
            raise HTTPException(status_code=400, detail="Email Invalid")

        result = await send_reset_code_to_user(db, user.email)
        logger.info(f"Code de réinitialisation envoyé à: {user.email}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du code de réinitialisation pour {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/reset-password-step2")
async def reset_password_endpoint(
    user: CodeResetPasswordRequest, db: asyncpg.Connection = Depends(get_db)
):
    """
    EndPoint pour Verifier le code 
    """
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if not db_user:
            logger.warning(f"Tentative de vérification échouée: email invalide {user.email}")
            raise HTTPException(status_code=400, detail="Email Invalid")

        result = await verify_code(db, user.email, user.code)
        logger.info(f"Code de réinitialisation vérifié avec succès pour: {user.email}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du code pour {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/reset-password-step3")
async def reset_password_endpoint(
    user: UpdatePasswordRequest, db: asyncpg.Connection = Depends(get_db)
):
    """
    EndPoint pour Reset le nouveau passé 
    """
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if not db_user:
            logger.warning(f"Tentative de réinitialisation échouée: email invalide {user.email}")
            raise HTTPException(status_code=400, detail="Email Invalid")

        result = await reset_password_request(db, user)
        logger.info(f"Mot de passe réinitialisé avec succès pour: {user.email}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la réinitialisation du mot de passe pour {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
