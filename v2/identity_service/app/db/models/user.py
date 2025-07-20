from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
    Boolean,
    Float,
    Sequence,
    event,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, inspect
import uuid
from datetime import datetime
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
    password_salt = Column(String, nullable=False)
    date_birth = Column(String, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    role = Column(String, default="client")
    pointstudios = Column(Integer, default=0)
    pointevents = Column(Integer, default=0)
    barcode_seq = Sequence("barcode_seq", start=120000001)  # Sequence for auto-increment
    barcode = Column(Integer, nullable=True, server_default=barcode_seq.next_value())
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)


# Supprimer et recréer uniquement la table "users" si elle existe
if __name__ == "__main__":
    print("Vérification et suppression de la table 'users' si elle existe...")

    inspector = inspect(engine)
    
    # Vérifier si la table existe
    if "users" in inspector.get_table_names():
        print("Table 'users' existante trouvée. Suppression en cours...")
        User.__table__.drop(engine)  # Supprimer la table 'users'

    
    # Créer la table
    print("Création de la table 'users'...")
    Base.metadata.create_all(engine)
    print("Table 'users' créée avec succès.")
