from datetime import datetime
from uuid import uuid4
import asyncpg
import base64
from typing import List
from PIL import Image
from io import BytesIO
from barcode.codex import Code128
import aio_pika
import random
from fastapi import HTTPException
from app.core.security import get_password_hash
from app.db.schemas.user import UserCreate, UserResponse, UserResponseFind,UserUpdate
from app.db.schemas.password import ResetPasswordRequest, UpdatePasswordRequest
from asyncpg import Connection
import uuid
from app.db.models.user import User
import os
import barcode
from barcode.writer import ImageWriter
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from sqlalchemy import select
import traceback
from sqlalchemy.orm import selectinload
import logging

# Configuration du logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

RABBITMQ_URL = "amqp://guest:guest@localhost:5672"# Configurez l'URL de RabbitMQ
ACTIVATE_COMPTE_QUEUE = "activate_compte_queue"# Nom de la file d'attente RabbitMQ
UPDATE_PASSWORD_QUEUE="update_password_queue"

async def register_user(db: AsyncSession, user: UserCreate) -> UserResponse:
    try:
        result = await db.execute(select(User).where(User.email == user.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "EMAIL_ALREADY_REGISTERED",
                    "message": "The provided email is already registered. Please use a different email."
                }
            )

        hashed_password, salt_password = get_password_hash(user.password)
        
       
        
        new_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password_hash=hashed_password,
            password_salt=salt_password,
            date_birth=user.date_birth,
            is_email_verified=False,
        
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        logging.info("User registered successfully: %s", new_user.email)
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            # Création d'un canal
            channel = await connection.channel()

            # Déclarer la queue
            await channel.declare_queue(ACTIVATE_COMPTE_QUEUE, durable=True)

            # Publier le message
            message = aio_pika.Message(
                body=json.dumps({"first_name": user.first_name, "last_name": user.last_name,"email":user.email}).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await channel.default_exchange.publish(message, routing_key=ACTIVATE_COMPTE_QUEUE)
        return new_user

    except HTTPException as http_error:
        logging.error("HTTP error during user registration: %s", http_error.detail)
        raise
    except Exception as e:
        logging.error("Unexpected error during user registration: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact support if the problem persists."
            }
        )



async def register_user_admin(db: AsyncSession, user: UserCreate) -> UserResponse:
        try:
            result = await db.execute(select(User).where(User.email == user.email))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "EMAIL_ALREADY_REGISTERED",
                        "message": "The provided email is already registered."
                    }
                )

            hashed_password, salt_password = get_password_hash(user.password)

            new_user = User(
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                password_hash=hashed_password,
                password_salt=salt_password,
                date_birth=user.date_birth,
                is_email_verified=False,
                role="admin"
            )

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            logging.info("User registered successfully: %s", new_user.email)

            return new_user

        except HTTPException as http_error:
            logging.error("HTTP error during admin registration: %s", http_error.detail)
            raise
        except Exception as e:
            logging.error("Unexpected error during admin registration: %s", str(e))
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": f"An unexpected error occurred: {str(e)}"
                }
            )

async def update_user(db: AsyncSession, user_id: uuid.UUID, user: UserUpdate) -> UserResponse:
    try:
        # Vérifie si l'utilisateur existe
        result = await db.execute(select(User).where(User.id == user_id))
        existing_user = result.scalar_one_or_none()

        if not existing_user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        # Mise à jour des champs
        existing_user.first_name = user.first_name
        existing_user.last_name = user.last_name
        existing_user.email = user.email
        existing_user.date_birth = user.date_birth

        await db.commit()
        await db.refresh(existing_user)

        logging.info("User updated successfully: %s", existing_user.email)

        # Envoie un message via RabbitMQ (si nécessaire)
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(ACTIVATE_COMPTE_QUEUE, durable=True)

            message = aio_pika.Message(
                body=json.dumps({
                    "first_name": existing_user.first_name,
                    "last_name": existing_user.last_name,
                    "email": existing_user.email
                }).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await channel.default_exchange.publish(message, routing_key=ACTIVATE_COMPTE_QUEUE)

        return existing_user

    except HTTPException as http_error:
        logging.error("HTTP error during user update: %s", http_error.detail)
        raise
    except Exception as e:
        logging.error("Unexpected error during user update: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact support if the problem persists."
            }
        )
    
async def activate_user_email(db: AsyncSession, email: str):
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        user.is_email_verified = True
        await db.commit()
        await db.refresh(user)

        logging.info("Email activated successfully for: %s", email)

        return {"message": "Email verified"}

    except Exception as e:
        logging.error("Error activating email: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error.")

async def get_user(db: AsyncSession, user_id: uuid.UUID) -> UserResponse:
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            logging.warning("Utilisateur non trouvé avec l'ID : %s", user_id)
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        return user

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Erreur lors de la récupération de l'utilisateur par ID : %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur.")


async def get_userv1_by_email(db: AsyncSession, email: str) -> UserResponse:
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            logging.warning("User not found with email: %s", email)
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        return user

    except Exception as e:
        logging.error("Error fetching user by email: %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur")

async def get_user_by_email(db: AsyncSession, email: str) -> UserResponse:
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            logging.warning("User not found with email: %s", email)
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        return user

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching user by email: %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur")

async def delete_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> bool:
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            logging.warning("Utilisateur non trouvé avec l'ID : %s", user_id)
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        await db.delete(user)
        await db.commit()

        logging.info("Utilisateur supprimé avec succès avec l'ID : %s", user_id)
        return True

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Erreur lors de la suppression de l'utilisateur : %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur")
    
async def get_users(db: AsyncSession) -> List[UserResponseFind]:
    try:
        result = await db.execute(select(User).order_by(User.first_name.asc()))
        users = result.scalars().all()

        if not users:
            logging.info("Aucun utilisateur trouvé.")
            return []

        return [
            user for user in users
        ]

    except Exception as e:
        logging.error("Erreur lors de la récupération des utilisateurs : %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des utilisateurs.")

async def update_user_password(db: AsyncSession, user_id: uuid.UUID, new_password: str, salt: str) -> dict:
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            logging.warning("Utilisateur non trouvé avec l'ID : %s", user_id)
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        user.password_hash = new_password
        user.password_salt = salt

        await db.commit()
        await db.refresh(user)

        logging.info("Mot de passe mis à jour avec succès pour l'ID : %s", user_id)

        return {
            "id": str(user.id),
            "pointevents": user.pointevents,
            "pointstudios": user.pointstudios
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Erreur lors de la mise à jour du mot de passe : %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur")
    
async def reset_password_request(db: AsyncSession, user: UpdatePasswordRequest):
    try:
        result = await db.execute(select(User).where(User.email == user.email))
        user_obj = result.scalar_one_or_none()

        if not user_obj:
            logging.warning("User not found for password reset: %s", user.email)
            raise HTTPException(status_code=404, detail="User not found")

        # Hash du mot de passe
        hashed_password, salt_password = get_password_hash(user.new_password)

        # Envoi du message RabbitMQ
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(UPDATE_PASSWORD_QUEUE, durable=True)

            message = aio_pika.Message(
                body=json.dumps({
                    "first_name": user_obj.first_name,
                    "last_name": user_obj.last_name,
                    "email": user_obj.email
                }).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await channel.default_exchange.publish(message, routing_key=UPDATE_PASSWORD_QUEUE)

        # Mise à jour du mot de passe
        return await update_user_password(
            db=db,
            user_id=user_obj.id,
            new_password=hashed_password,
            salt=salt_password
        )

    except HTTPException as http_error:
        logging.error("HTTP error during password reset request: %s", http_error.detail)
        raise
    except Exception as e:
        logging.error("Unexpected error during password reset request: %s", str(e))
        raise HTTPException(status_code=500, detail="Erreur serveur.")
    
async def generate_barcode(user):
    try:
        reference_number = f"{user.barcode}"
        
        buffer = BytesIO()
        writer = ImageWriter()
        code128 = Code128(reference_number, writer=writer)
        code128.write(buffer)
        buffer.seek(0)

        barcode_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        logging.info("Barcode generated successfully for user: %s", reference_number)
        return reference_number, barcode_base64

    except ValueError as ve:
        logging.error("Value error during barcode generation: %s", str(ve))

        raise RuntimeError(f"Erreur lors de la génération du code-barres : {ve}") from ve