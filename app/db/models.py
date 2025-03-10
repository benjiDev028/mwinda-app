from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nom = Column(String, nullable=False)
    chemin = Column(String, nullable=False, unique=True)
    nbre_like = Column(Integer, default=0)
