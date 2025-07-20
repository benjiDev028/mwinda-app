from fastapi import APIRouter, HTTPException, Depends

from uuid import UUID
from app.db.session import get_db
from fastapi.encoders import jsonable_encoder

from app.db.schemas.user import UserFindByBirth, UserFindByName, UserFindByEmail,UserUpdate
from app.services.user_service import get_users,  get_user_by_email, get_user ,update_user,delete_user_by_id

import logging
from sqlalchemy.ext.asyncio import AsyncSession





# Configuration du logger
logger = logging.getLogger("user_management")
logging.basicConfig(level=logging.INFO)



router = APIRouter(prefix="/identity", tags=["GestionUsers"])

@router.get("/get_all_users")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    """
    Récupérer tous les utilisateurs.
    """

    users = await get_users(db)   
    return jsonable_encoder(users)

   
@router.get("/get_user_by_mail")
async def get_user_by_mail(user: UserFindByEmail, db: AsyncSession = Depends(get_db)):
   
   
    users = await get_user_by_email(db, user.email)   
    return jsonable_encoder(users)

@router.get("/get_user_by_id/{user_id}")
async def get_user_by_id(user_id: UUID, db: AsyncSession = Depends(get_db)):
    
   
    user_data = await get_user(db, user_id)       
    return jsonable_encoder(user_data)
   

@router.delete("/delete_user_by_id/{user_id}")
async def delete_by_id(user_id: UUID, db: AsyncSession = Depends(get_db)):
    
    return await delete_user_by_id(db, user_id)        
   
   

@router.put("/update_user_by_id/{user_id}")
async def update_user_by_id(user_id: UUID, user: UserUpdate, db: AsyncSession = Depends(get_db)):
    """
    Mettre à jour un utilisateur par son ID passé dans l'URL.
    """

        # # Vérifier si l'utilisateur existe
        # user_data = await get_user(db, user_id)
        # if not user_data:
        #     logging.error(f"Utilisateur avec l'ID {user_id} non trouvé.")
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé.")
        
       
    updated_user = await update_user(db, user_id, user)
    return jsonable_encoder(updated_user)
    
    