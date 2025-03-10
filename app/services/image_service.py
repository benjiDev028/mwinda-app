from sqlalchemy.orm import Session
from app.db.models import Image
import uuid

def create_image(db: Session, nom: str, chemin: str):
    image = Image(nom=nom, chemin=chemin)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

def get_image(db: Session, image_id: uuid.UUID):
    return db.query(Image).filter(Image.id == image_id).first()

def get_all_images(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Image).offset(skip).limit(limit).all()

def update_image(db: Session, image_id: uuid.UUID, nom: str = None, chemin: str = None):
    image = db.query(Image).filter(Image.id == image_id).first()
    if image:
        if nom:
            image.nom = nom
        if chemin:
            image.chemin = chemin
        db.commit()
        db.refresh(image)
    return image

def delete_image(db: Session, image_id: uuid.UUID):
    image = db.query(Image).filter(Image.id == image_id).first()
    if image:
        db.delete(image)
        db.commit()
    return image

def add_like(db: Session, image: Image):
    image.nbre_like += 1
    db.commit()
    db.refresh(image)
    return image
