from fastapi import APIRouter, HTTPException, Depends

from uuid import UUID
from app.db.database import get_db
from fastapi.encoders import jsonable_encoder

from app.db.schemas.user import UserFindByBarcode, UserFindByEmail,UserUpdate
from app.services.user_service import get_users,  get_user_by_email, get_user ,update_user,delete_user_by_id, get_user_by_barcode

import logging
from sqlalchemy.future import select
from app.db.models.user import User
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

@router.get("/get_user_by_barcode/{barcode}")
async def get_user_by_mail(barcode: int, db: AsyncSession = Depends(get_db)):
   
   
    users = await get_user_by_barcode(db, barcode)   
    return jsonable_encoder(users)


@router.get("/get_user_by_id/{user_id}")
async def get_user_by_id(user_id: UUID, db: AsyncSession = Depends(get_db)):
    
   
    user_data = await get_user(db, user_id)       
    return jsonable_encoder(user_data)
   

@router.put("/identity/update_user_points/{user_id}")
async def update_user_points(user_id: UUID, payload: dict, db: AsyncSession = Depends(get_db)):
    """
    Met à jour les points de fidélité d’un utilisateur (event ou studio)
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if "pointstudios" in payload:
        user.pointstudios = payload["pointstudios"]
    if "pointevents" in payload:
        user.pointevents = payload["pointevents"]

    await db.commit()
    return {"message": "Points mis à jour"}


# Dans le router du microservice user
@router.post("/update_user_points")
async def update_user_points(data: dict,db: AsyncSession = Depends(get_db)):
    """
    Met à jour les points d'un utilisateur selon la référence
    """
    try:
        user_id = UUID(data["user_id"])
        points = data["points"]
        reference = data["reference"]
        
        # Récupérer l'utilisateur
        user = await db.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Mettre à jour les points selon la référence
        if reference == "Event":
            user.pointevents += points
        elif reference == "Studio":
            user.pointstudios += points
        else:
            raise HTTPException(status_code=400, detail="Invalid reference")
        
        await db.commit()
        return {"status": "success", "message": "Points updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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
    
    