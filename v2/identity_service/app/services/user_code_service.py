from datetime import datetime, timedelta
from uuid import uuid4
import asyncpg
import aio_pika
import random
from fastapi import HTTPException
from asyncpg import Connection
import uuid
import json
import os
import logging
from app.db.models.user import User
from app.db.models.user_code import UserCode
from sqlalchemy import select
import traceback
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession



from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL = os.getenv("RABBITMQ_URL")  #  Configurez l'URL de RabbitMQ
QUEUE_NAME = "reset_password_queue"  # Nom de la file RabbitMQ

# Configure le logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# CRUD pour la vérification d'email
async def get_code_by_email(db: AsyncSession, email: str) -> UserCode:
    try:
        result = await db.execute(select(UserCode).where(UserCode.email == email))
        code = result.scalar_one_or_none()

        if not code:
            logging.warning("Code introuvable pour l'adresse email : %s", email)
            raise HTTPException(status_code=404, detail="Code introuvable")

        return code

    except Exception as e:
        logging.error(f"Erreur lors de la récupération du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la récupération du code.")

async def create_user_code(db: AsyncSession, email: str, code: int):
    try:
        new_code = UserCode(
          
            email=email,
            code=code,
            created_at=datetime.utcnow()
        )
        db.add(new_code)
        await db.commit()
        await db.refresh(new_code)

        logging.info("Code créé avec succès pour : %s", email)

    except Exception as e:
        logging.error(f"Erreur lors de la création du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la création du code.")

async def update_user_code(db: AsyncSession, email: str, code: int):
    try:
        result = await db.execute(select(UserCode).where(UserCode.email == email))
        user_code = result.scalar_one_or_none()

        if not user_code:
            raise HTTPException(status_code=404, detail="Code introuvable pour cet email")

        user_code.code = code
        user_code.created_at = datetime.utcnow()

        await db.commit()
        await db.refresh(user_code)

        logging.info("Code mis à jour avec succès pour : %s", email)

    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour du code.")
    
async def delete_user_code(db: AsyncSession, email: str):
    try:
        result = await db.execute(select(UserCode).where(UserCode.email == email))
        user_code = result.scalar_one_or_none()

        if not user_code:
            raise HTTPException(status_code=404, detail="Code introuvable pour cet email")

        await db.delete(user_code)
        await db.commit()

        logging.info("Code supprimé avec succès pour : %s", email)

    except Exception as e:
        logging.error(f"Erreur lors de la suppression du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la suppression du code.")

#rabbit mq configuration



async def send_reset_code_to_user(db: AsyncSession, email: str):
    reset_code = random.randint(10000, 99999)  # PAS DE str()


    try:
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(QUEUE_NAME, durable=True)

            message = aio_pika.Message(
                body=json.dumps({"email": email, "reset_code": reset_code}).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await channel.default_exchange.publish(message, routing_key=QUEUE_NAME)
            logging.info(f"Code de réinitialisation envoyé à {email} : {reset_code}")
    except Exception as e:
        logging.error(f"RabbitMQ KO pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur envoi du code.")

    try:
        result = await db.execute(select(UserCode).where(UserCode.email == email))
        user_code = result.scalar_one_or_none()

        if user_code:
            user_code.code = int(reset_code)
            user_code.created_at = datetime.utcnow()
        else:
            user_code = UserCode(
           
                email=email,
                code=int(reset_code),
                created_at=datetime.utcnow()
            )
            db.add(user_code)

        await db.commit()
        logging.info(f"Code {reset_code} sauvegardé pour {email}")
    except Exception as e:
        logging.error(f"Erreur DB pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur sauvegarde du code.")

    return {"message": "Code envoyé avec succès."}

async def verify_code(db: AsyncSession, email: str, code: str):
    try:
        result = await db.execute(select(UserCode).where(UserCode.email == email))
        user_code = result.scalar_one_or_none()

        if not user_code:
            raise HTTPException(status_code=404, detail="Code non trouvé.")

        if not user_code.code or str(user_code.code) != str(code):
            raise HTTPException(status_code=400, detail="Code invalide.")

        if datetime.utcnow() - user_code.created_at > timedelta(minutes=5):
            raise HTTPException(status_code=400, detail="Code expiré.")

        await db.delete(user_code)
        await db.commit()

        logging.info(f"Code validé et supprimé pour {email}")
        return {"message": "Code validé avec succès."}

    except HTTPException as e:
        logging.warning(f"Échec vérification code pour {email}: {e.detail}")
        raise
    except Exception as e:
        logging.error(f"Erreur vérification code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la vérification du code.")