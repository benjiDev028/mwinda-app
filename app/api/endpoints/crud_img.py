import os
import shutil
import uuid
import logging
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.services.image_service import create_image, add_like, get_image, get_all_images, update_image, delete_image
from app.db.session import SessionLocal
from app.db.schemas import ImageInDB, ImageUpdate
from app.core.config import settings

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Crée le dossier s'il n'existe pas

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}

@router.post("/", response_model=ImageInDB)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Format de fichier non supporté")

        filename = f"{uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Sauvegarde de l'image
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        db_image = await create_image(db, nom=file.filename, chemin=file_path)
        logger.info(f"Image {file.filename} sauvegardée sous {file_path}")
        return db_image
    except Exception as e:
        logger.error(f"Erreur lors de l'upload de l'image : {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.get("/{image_id}", response_model=ImageInDB)
async def get_image_api(image_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        image = await get_image(db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image non trouvée")
        return image
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'image {image_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.get("/", response_model=list[ImageInDB])
async def get_all_images_api(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    try:
        images = await get_all_images(db, skip, limit)
        return images
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des images : {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.put("/{image_id}", response_model=ImageInDB)
async def update_image_api(image_id: uuid.UUID, image: ImageUpdate, db: Session = Depends(get_db)):
    try:
        updated_image = await update_image(db, image_id, nom=image.nom, chemin=image.chemin)
        return updated_image
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'image {image_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.delete("/{image_id}", response_model=ImageInDB)
async def delete_image_api(image_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        deleted_image = await delete_image(db, image_id)
        return deleted_image
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'image {image_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.post("/{image_id}/like", response_model=ImageInDB)
async def like_image(image_id: str, db: Session = Depends(get_db)):
    try:
        image = await get_image(db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image non trouvée")

        image = await add_like(db, image)
        logger.info(f"Like ajouté à l'image {image_id}")
        return image
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout du like à l'image {image_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
