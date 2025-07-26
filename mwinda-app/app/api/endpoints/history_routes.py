

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.loyalty_service import get_loyalty_history, delete_loyalty_history , update_loyalty_history , get_user_loyalty_history , get_admin_loyalty_history, get_all_loyalty_history
import uuid
from app.db.schemas import LoyaltyHistoryCreate, LoyaltyHistoryResponse, LoyaltyAllHistoryResponse
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.schemas import UserResponse, LoyaltyHistoryCreate
from app.services.loyalty_service import add_points
from app.services.loyalty_service import redeem_user_points
from app.db.schemas import RedeemPointsRequest, RedeemPointsResponse

from fastapi import FastAPI, HTTPException, Depends, Request
from starlette.responses import JSONResponse
from uuid import UUID
import logging
from app.services.rabbitmq_publisher import send_threshold_reached_notification


from dotenv import load_dotenv
from sqlalchemy.future import select
import os

# Charger les variables d'environnement
load_dotenv()
RABBITMQ_URL = os.getenv("RABBITMQ_URL")
REWARD_THRESHOLD = 50000

router = APIRouter()
app = FastAPI()

# Configurer le logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




@router.get("hist/{loyalty_id}", response_model=LoyaltyHistoryResponse)
async def get_history(loyalty_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Recuperer les Infos d'un historique via l'id
    """
    history = await get_loyalty_history(db, loyalty_id)
    if not history:
        logger.warning("Historique non trouvé: %s", loyalty_id)
        raise HTTPException(status_code=404, detail="Historique non trouvé")
    return history

@router.get("/all_histories", response_model=List[LoyaltyHistoryResponse])    
async def get_all_histories(db: AsyncSession = Depends(get_db)):
    """
    Recuperer tous les historiques
    """
    histories = await get_all_loyalty_history(db)
    if not histories:
        logger.warning("Aucun historique trouvé")
        raise HTTPException(status_code=404, detail="Aucun historique trouvé")
    
    return histories

@router.get("/user/{user_id}", response_model=List[LoyaltyHistoryResponse])
async def get_user_history(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):

    """
    Recuperer tous l'historique d'un utilisateur
    """

    try:
        history = await get_user_loyalty_history(db, user_id)
        return history
    except Exception as e:
        logger.error("Erreur lors de la récupération de l'historique utilisateur %s: %s", user_id, str(e))
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
    

@router.get("/admin/{id_admin}", response_model=List[LoyaltyHistoryResponse])
async def get_user_history(id_admin: uuid.UUID, db: AsyncSession = Depends(get_db)):

    """
    Recuperer tous l'historique d'un Admin
    """

    try:
        history =await  get_admin_loyalty_history(db, id_admin)
        return history
    except Exception as e:
        logger.error("Erreur lors de la récupération de l'historique de l'admin %s: %s", id_admin, str(e))
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.put("/{loyalty_id}", response_model=LoyaltyHistoryResponse)
async def update_history(loyalty_id: uuid.UUID, loyalty_data: LoyaltyHistoryCreate, db: AsyncSession = Depends(get_db)):
    """
    Maj les infos d'un historique
    """
    try:
        updated_history =await  update_loyalty_history(db, loyalty_id, loyalty_data)
        if not updated_history:
            logger.warning("Tentative de mise à jour d'un historique inexistant: %s", loyalty_id)
            raise HTTPException(status_code=404, detail="Historique non trouvé")
        logger.info("Historique mis à jour avec succès: %s", loyalty_id)
        return updated_history
    except Exception as e:
        logger.error("Erreur lors de la mise à jour de l'historique %s: %s", loyalty_id, str(e))
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.delete("/{loyalty_id}")
async def delete_history(loyalty_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Supprimer un historique
    """
    try:
        if not await  delete_loyalty_history(db, loyalty_id):
            logger.warning("Tentative de suppression d'un historique inexistant: %s", loyalty_id)
            raise HTTPException(status_code=404, detail="Historique non trouvé")
        logger.info("Historique supprimé avec succès: %s", loyalty_id)
        return {"message": "Historique supprimé avec succès"}
    except Exception as e:
        logger.error("Erreur lors de la suppression de l'historique %s: %s", loyalty_id, str(e))
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
