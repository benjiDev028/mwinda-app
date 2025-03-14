from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import EmailStr
from asyncpg import Connection
from uuid import UUID
from fastapi.encoders import jsonable_encoder
from app.db.session import connect_to_db, close_db_connection
from app.db.schemas.user import UserFindByBirth, UserFindByName, UserFindByEmail, UserFindById,UserUpdate
from app.services.user_service import get_users, get_by_username, get_user_by_email, get_user, get_users_by_birthday,update_user,delete_user_by_id
import asyncpg
import logging

# Configuration du logger
logger = logging.getLogger("user_management")
logging.basicConfig(level=logging.INFO)

# Dépendance pour obtenir la session de base de données
async def get_db():
    db = await connect_to_db()
    try:
        yield db
    finally:
        await close_db_connection(db)

router = APIRouter(prefix="/identity", tags=["GestionUsers"])

@router.get("/get_all_users")
async def get_all_users(db: asyncpg.Connection = Depends(get_db)):
    """
    Récupérer tous les utilisateurs.
    """
    try:
        users = await get_users(db)
        if not users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found.")
        return jsonable_encoder(users)
    except ValueError as e:
        logger.error(f"ValueError in get_all_users: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_all_users: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get("/get_users_by_name")
async def get_users_by_name(user: UserFindByName, db: asyncpg.Connection = Depends(get_db)):
    """
    Récupérer les utilisateurs par prénom et/ou nom d'utilisateur.
    """
    try:
        users = await get_by_username(db, user.first_name , user.last_name)
        if not users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found with the provided name(s).")
        return jsonable_encoder(users)
    except ValueError as e:
        logger.error(f"ValueError in get_users_by_name: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_users_by_name: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get("/get_user_by_mail")
async def get_user_by_mail(user: UserFindByEmail, db: asyncpg.Connection = Depends(get_db)):
    """
    Récupérer un utilisateur par email.
    """
    try:
        users = await get_user_by_email(db, user.email)
        if not users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return jsonable_encoder(users)
    except ValueError as e:
        logger.error(f"ValueError in get_user_by_mail: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_user_by_mail: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get("/get_users_by_birth")
async def get_users_by_birth(user: UserFindByBirth, db: asyncpg.Connection = Depends(get_db)):
    """
    Récupérer les utilisateurs par date d'anniversaire.
    """
    try:
        logger.info(f"Recherche des Utilisateurs  né le  : {user.date_birth}")
        users = await get_users_by_birthday(db, user.date_birth)
        if not users:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users found with the provided birth date.")
        return jsonable_encoder(users)
    except ValueError as e:
        logger.error(f"ValueError in get_users_by_birth: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_users_by_birth: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")


@router.get("/get_user_by_id/{user_id}")
async def get_user_by_id(user_id: UUID, db: asyncpg.Connection = Depends(get_db)):
    """
    Récupérer un utilisateur par son ID passé dans l'URL.
    """
    try:
        user_data = await get_user(db, user_id)
        if not user_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé.")
        return jsonable_encoder(user_data)
    except ValueError as e:
        logging.error(f"ValueError dans get_user_by_id : {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logging.error(f"Erreur inattendue dans get_user_by_id : {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Une erreur inattendue est survenue.")



@router.delete("/delete_user_by_id/{user_id}")
async def delete_by_id(user_id: UUID, db: asyncpg.Connection = Depends(get_db)):
    try:
        success = await delete_user_by_id(db, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé")
        return {"message": "Utilisateur supprimé avec succès"}
    except RuntimeError as e:
        logging.error(f"Erreur inattendue dans delete_user_by_id : {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Une erreur inattendue s'est produite.")

@router.put("/update_user_by_id/{user_id}")
async def update_user_by_id(user_id: UUID, user: UserUpdate, db: asyncpg.Connection = Depends(get_db)):
    """
    Mettre à jour un utilisateur par son ID passé dans l'URL.
    """
    try:
        # Vérifier si l'utilisateur existe
        user_data = await get_user(db, user_id)
        if not user_data:
            logging.error(f"Utilisateur avec l'ID {user_id} non trouvé.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé.")
        
        # Appeler la fonction pour mettre à jour l'utilisateur
        updated_user = await update_user(db, user_id, user)
        
        if not updated_user:
            logging.error(f"Echec de la mise à jour de l'utilisateur avec l'ID {user_id}.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Échec de la mise à jour.")
        
        # Retourner les données de l'utilisateur mis à jour
        return jsonable_encoder(updated_user)
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour de l'utilisateur: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur serveur.")