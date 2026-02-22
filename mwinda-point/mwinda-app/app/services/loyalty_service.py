from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from uuid import UUID
import aio_pika
import json
import os
import httpx

from app.db.models import  LoyaltyHistory
from app.db.schemas import RedeemPointsResponse

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
ADD_POINT_QUEUE = "add_point_queue"
EARN_POINT_QUEUE = "earn_point_queue"
API_URL = os.getenv("API_URL")
PORT_USER = os.getenv("PORT_USER")

url= f"{API_URL}{PORT_USER}"


async def calculate_points(amount_cdf: float) -> float:
    return amount_cdf * 100



async def get_user_from_user_service(user_id: UUID):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{url}/identity/get_user_by_id/{user_id}")
        if response.status_code == 200:
            return response.json()
        raise ValueError("Utilisateur introuvable dans le microservice user")
    
async def add_points(db: AsyncSession, user_id: UUID, amount: float, devise: str, service: str, id_admin: UUID, reference: str):
    if not amount:
        raise ValueError("Montant invalide")

    user = await get_user_from_user_service(user_id)
    points = await calculate_points(amount)

    # Appeler le microservice user pour mettre à jour les points
    async with httpx.AsyncClient() as client:
        update_data = {
            "user_id": str(user_id),
            "points": points,
            "reference": reference
        }
        response = await client.post(f"{url}/identity/update_user_points", json=update_data)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Échec de l'ajout des points")

    # Enregistrer l'historique localement
    history = LoyaltyHistory(
        user_id=user['id'],
        points=points,
        amount=amount,
        service=service,
        id_admin=id_admin,
        reference=reference,
    )

    db.add(history)
    await db.commit()

    # Envoyer la notification RabbitMQ
    try:
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(ADD_POINT_QUEUE, durable=True)

            payload = {
                "type": "points_added",
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "reference": reference,
                "points_added": points
            }

            message = aio_pika.Message(
                body=json.dumps(payload).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            )

            await channel.default_exchange.publish(message, routing_key=ADD_POINT_QUEUE)

    except Exception as e:
        print(f"Erreur RabbitMQ (add_points) : {e}")

    return await get_user_from_user_service(user_id)  # Retourner les données à jours


async def redeem_user_points(db: AsyncSession, user_id: UUID, admin_id: UUID, reference: str) -> RedeemPointsResponse:
    try:
        # Récupérer l'utilisateur depuis le microservice user
        user = await get_user_from_user_service(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable")

        points_used = 0
        if reference == "Event":
            if user["pointevents"] is None or user["pointevents"] < 40000:
                raise HTTPException(status_code=400, detail="Pas assez de points pour un événement")
            points_used = 40000
        elif reference == "Studio":
            if user["pointstudios"] is None or user["pointstudios"] < 5000:
                raise HTTPException(status_code=400, detail="Pas assez de points pour un studio")
            points_used = 5000
        else:
            raise HTTPException(status_code=400, detail="Référence inconnue")

        # Appeler le microservice user pour mettre à jour les points
        async with httpx.AsyncClient() as client:
            update_data = {
                "user_id": str(user_id),
                "points": -points_used,
                "reference": reference
            }
            response = await client.post(f"{url}/identity/update_user_points", json=update_data)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Échec de la mise à jour des points")

        # Enregistrer l'historique dans la base locale
        history = LoyaltyHistory(
            user_id=user_id,
            id_admin=admin_id,
            points=-points_used,
            amount=0,
            service="",
            reference=reference
        )

        db.add(history)
        await db.commit()

        # Envoyer la notification RabbitMQ
        try:
            connection = await aio_pika.connect_robust(RABBITMQ_URL)
            async with connection:
                channel = await connection.channel()
                await channel.declare_queue(EARN_POINT_QUEUE, durable=True)

                payload = {
                    "type": "redeem_success",
                    "email": user["email"],
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "reference": reference,
                    "points_used": points_used
                }

                message = aio_pika.Message(
                    body=json.dumps(payload).encode(),
                    content_type="application/json",
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                )

                await channel.default_exchange.publish(message, routing_key=EARN_POINT_QUEUE)

        except Exception as e:
            print(f"Erreur RabbitMQ (redeem_user_points) : {e}")

        return RedeemPointsResponse(
            message="Points échangés avec succès",
            user_id=user_id,
            reference=reference,
            points_used=points_used
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))



from sqlalchemy.orm import Session
from app.db.models import LoyaltyHistory
from app.db.schemas import LoyaltyHistoryCreate
from sqlalchemy import desc
import uuid


async def get_loyalty_history(db: AsyncSession, loyalty_id: uuid.UUID):

    result = await db.execute(select(LoyaltyHistory).where(id=loyalty_id))
    return result.scalar_one_or_none()

async def get_all_loyalty_history(db: AsyncSession):
    result = await db.execute(select(LoyaltyHistory).order_by(desc(LoyaltyHistory.date_points)))
    return result.scalars().all()


async def get_user_loyalty_history(db: AsyncSession, user_id: uuid.UUID):
    
    result = await db.execute(select(LoyaltyHistory).filter_by(user_id=user_id).order_by(desc(LoyaltyHistory.date_points)))
    return result.scalars().all()

async def get_admin_loyalty_history(db: AsyncSession, id_admin: uuid.UUID):
    result = await db.execute(select(LoyaltyHistory).filter_by(id_admin=id_admin).order_by(desc(LoyaltyHistory.date_points)))
    return result.scalars().all()

async def update_loyalty_history(db: AsyncSession, loyalty_id: uuid.UUID, loyalty_data: LoyaltyHistoryCreate):
    result =await  db.execute(select(LoyaltyHistory).filter_by(id=loyalty_id))
    history = result.scalar_one_or_none()
    if not history:
        return None
    
    for key, value in loyalty_data.dict().items():
        setattr(history, key, value)
    
    await db.commit()
    await db.refresh(history)
    return history

async def delete_loyalty_history(db: AsyncSession, loyalty_id: uuid.UUID):
    result = await db.execute(select(LoyaltyHistory).filter_by(id=loyalty_id))
    history = result.scalar_one_or_none()
    if history:
        await db.delete(history)
        await db.commit()
        return True
    return False