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
from dotenv import load_dotenv

load_dotenv()

# Configure le logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# CRUD pour la vérification d'email
async def get_code_by_email(db: asyncpg.Connection, email: str):
    try:
        query = "SELECT * FROM user_codes WHERE email = $1"
        return await db.fetchrow(query, email)
    except Exception as e:
        logging.error(f"Erreur lors de la récupération du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la récupération du code.")

async def create_user_code(db: asyncpg.Connection, email: str, code: int):
    try:
        query = "INSERT INTO user_codes (email, code) VALUES ($1, $2)"
        await db.execute(query, email, code)
    except Exception as e:
        logging.error(f"Erreur lors de la création du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la création du code.")

async def update_user_code(db: asyncpg.Connection, email: str, code: int):
    try:
        query = "UPDATE user_codes SET code = $1, created_at = NOW() WHERE email = $2"
        await db.execute(query, code, email)
    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la mise à jour du code.")

async def delete_user_code(db: asyncpg.Connection, email: str):
    try:
        query = "DELETE FROM user_codes WHERE email = $1"
        await db.execute(query, email)
    except Exception as e:
        logging.error(f"Erreur lors de la suppression du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la suppression du code.")



#rabbit mq configuration

RABBITMQ_URL = "amqp://guest:guest@localhost:5672"# Configurez l'URL de RabbitMQ
QUEUE_NAME = "reset_password_queue"  # Nom de la file RabbitMQ

async def send_reset_code_to_user(db: asyncpg.Connection, email: str):
    """
    Envoie le code à l'utilisateur via mail et sauvegarde
    """
    reset_code =str(random.randint(10000, 99999))

    try:
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            # Création d'un canal
            channel = await connection.channel()

            # Déclarer la queue
            await channel.declare_queue(QUEUE_NAME, durable=True)

            # Publier le message
            message = aio_pika.Message(
                body=json.dumps({"email": email, "reset_code": reset_code}).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await channel.default_exchange.publish(message, routing_key=QUEUE_NAME)

            logging.info(f"Code de réinitialisation envoyé à {email} : {reset_code}")
    except Exception as e:
        logging.error(f"Erreur lors de l'envoi du message RabbitMQ pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de l'envoi du code.")

    try:
        # Sauvegarder le code une fois envoyé
        query = """
            INSERT INTO user_codes (email, code)
            VALUES ($1, $2)
            ON CONFLICT (email) DO UPDATE 
            SET code = EXCLUDED.code, created_at = CURRENT_TIMESTAMP
        """
        await db.execute(query, email, int(reset_code))
        logging.info(f"Code {reset_code} sauvegardé pour {email}")
    except Exception as e:
        logging.error(f"Erreur lors de la sauvegarde du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la sauvegarde du code.")

    return {"message": "Code envoyé avec succès."}

async def verify_code(db: asyncpg.Connection, email: str, code: str):
    """
    Vérifie le code de confirmation, qu'il est valide et qu'il a été généré
    il y a moins de 5 minutes.
    """
    try:
        query = "SELECT code, created_at FROM user_codes WHERE email = $1"
        record = await db.fetchrow(query, email)

        if not record:
            raise HTTPException(status_code=404, detail="Code non trouvé.")

        stored_code, created_at = record["code"], record["created_at"]
        if not stored_code or str(stored_code) != str(code):
            raise HTTPException(status_code=400, detail="Code invalide.")

        # Vérifiez que le code n'a pas expiré (5 minutes maximum)
        if datetime.now() - created_at > timedelta(minutes=5):
            raise HTTPException(status_code=400, detail="Code expiré.")

        # Supprimer le code une fois validé
        delete_query = "DELETE FROM user_codes WHERE email = $1"
        await db.execute(delete_query, email)

        logging.info(f"Code validé avec succès pour {email}")
        return {"message": "Code validé avec succès."}

    except HTTPException as e:
        logging.warning(f"Vérification du code pour {email} échouée: {e.detail}")
        raise
    except Exception as e:
        logging.error(f"Erreur lors de la vérification du code pour {email}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de la vérification du code.")
