from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,   
    Boolean,   
    Sequence,
    
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, inspect
import uuid
from datetime import datetime,timezone
from sqlalchemy.sql import func
from dotenv import load_dotenv
from app.db.base import Base
import os

# Charger les variables d'environnement
load_dotenv()

# Configurer le moteur de base de données
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL doit être défini dans le fichier .env")

engine = create_engine(DATABASE_URL)

# Configurer la session
Session = sessionmaker(bind=engine)


# Modèle utilisateur
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    password_salt = Column(String, nullable=True)
    date_birth = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    role = Column(String, default="client")
    pointstudios = Column(Integer, default=0)
    pointevents = Column(Integer, default=0)
    barcode_seq = Sequence("barcode_seq", start=120000001)  # Sequence for auto-increment
    barcode = Column(Integer, nullable=True, server_default=barcode_seq.next_value())
    # ↘️ timezone=True = TIMESTAMPTZ côté PG si la colonne est bien déclarée
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

