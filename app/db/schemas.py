from pydantic import BaseModel
import uuid

class ImageBase(BaseModel):
    nom: str
    chemin: str

class ImageCreate(ImageBase):
    pass

class ImageUpdate(BaseModel):
    nom: str = None
    chemin: str = None

class ImageInDB(ImageBase):
    id: uuid.UUID
    nbre_like: int

    class Config:
        orm_mode = True
