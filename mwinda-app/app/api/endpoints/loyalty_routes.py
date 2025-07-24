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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne est survenue. Veuillez réessayer plus tard."},
    )





API_URL = os.getenv("API_URL")
PORT_USER = os.getenv("PORT_USER")

url= f"{API_URL}{PORT_USER}"


import httpx

@router.post("/earn_points", response_model=UserResponse)
async def earn_points(data: LoyaltyHistoryCreate, db: AsyncSession = Depends(get_db)):
    """
    Ajoute des points à un utilisateur en se basant sur son code-barre (reçu depuis le MS user)
    """
    logger.info(f"Requête pour ajouter des points pour le code-barre: {data.code_barre}, référence: {data.reference}")

    try:
        # 🔍 Appel au microservice `user` pour récupérer l'utilisateur
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{url}/identity/get_user_by_barcode/{data.code_barre}")
            if res.status_code != 200:
                raise HTTPException(status_code=404, detail=f"Utilisateur avec le code-barre {data.code_barre} introuvable.")
            user = res.json()

        # 🔢 Calcul du seuil AVANT ajout des points
        if data.reference == "Studio":
            threshold = 14000
            current_points = user["pointstudios"]
        else:
            threshold = 50000
            current_points = user["pointevents"]

        threshold_percentage = current_points / threshold
        logger.info(f"Seuil: {threshold} | Points actuels: {current_points} | Atteint: {threshold_percentage*100:.2f}%")

        # ➕ Ajout des points
        updated_user = await add_points(
            db=db,
            user_id=user["id"],
            amount=data.montant,
            devise="USD",
            service=data.service,
            id_admin=data.id_admin,
            reference=data.reference
        )

        # 🔢 Recalcul du seuil APRÈS ajout des points
        if data.reference == "Studio":
            new_points = updated_user["pointstudios"]
        else:
            new_points = updated_user["pointevents"]

        new_threshold_percentage = new_points / threshold
        logger.info(f"Points ajoutés. Nouveau solde: Studio={updated_user.get('pointstudios', 0)}, Event={updated_user.get('pointevents', 0)}")

        # 🔔 Notification si seuil atteint (utilisation des nouveaux points)
        if new_threshold_percentage >= 0.8:
            logger.info("Seuil de 80% atteint, envoi notification.")
            # Ajustez les paramètres selon la signature de votre fonction
            send_threshold_reached_notification(
                user_id=user["id"],
                current_points=new_points,
                threshold=threshold,
                reference=data.reference,
                pourcentage=new_threshold_percentage
            )

        return updated_user

    except HTTPException as http_err:
        logger.warning(f"Erreur HTTP: {http_err.detail}")
        raise http_err

    except ValueError as val_err:
        logger.error(f"Erreur validation: {val_err}")
        raise HTTPException(status_code=400, detail="Données invalides")

    except Exception as exc:
        logger.exception(f"Erreur inattendue: {exc}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.get("/loyalty_points/{user_id}", response_model=UserResponse)
async def get_loyalty_points(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Récupère les points totaux d'un utilisateur à partir de la table 'users'.
    """
    logger.info(f"Requête reçue pour récupérer les points de l'utilisateur avec ID: {user_id}")

    try:
        
        # result = await db.execute(select(User).where(User.id == user_id))
        # user = result.scalar_one_or_none()
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{url}/identity/get_user_by_id/{user_id}")
            if res.status_code != 200:
                raise HTTPException(status_code=404, detail=f"Utilisateur avec le code-barre {user_id} introuvable.")
            user = res.json()
        # user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Utilisateur avec l'ID {user_id} introuvable.")
            raise HTTPException(status_code=404, detail=f"Utilisateur avec l'ID {user_id} introuvable.")

        logger.info(f"Utilisateur trouvé: {user_id}. Points Studio: {user["pointstudios"]}, Points Event: {user["pointevents"]}")
        return user

    except HTTPException as http_err:
        logger.warning(f"Erreur HTTP détectée: {http_err.detail}")
        raise http_err

    except Exception as exc:
        logger.exception(f"Erreur inattendue lors de la récupération des points: {exc}")
        raise HTTPException(status_code=500, detail="Une erreur inattendue est survenue lors de la récupération des points.")


@router.post("/redeem_points", response_model=RedeemPointsResponse)
async def redeem_points(request: RedeemPointsRequest, db: AsyncSession = Depends(get_db)):
    """
    Échanger les points d'un utilisateur pour une récompense.
    """
    logger.info(f"Requête pour échanger des points. Utilisateur ID: {request.user_id}, Référence: {request.reference}")

    try:
        response = await redeem_user_points(db, request.user_id, request.admin_id,  request.reference)
        logger.info(f"Points échangés avec succès pour l'utilisateur {request.user_id}.")
        return response

    except HTTPException as http_err:
        logger.warning(f"Erreur HTTP détectée: {http_err.detail}")
        raise http_err

    except Exception as exc:
        logger.exception(f"Erreur inattendue lors de l'échange des points: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Une erreur inattendue est survenue lors de l'échange des points.",
        )

