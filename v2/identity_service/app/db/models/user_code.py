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

# Base de SQLAlchemy


# Configurer le moteur de base de données
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL doit être défini dans le fichier .env")

engine = create_engine(DATABASE_URL)

# Configurer la session
Session = sessionmaker(bind=engine)


class UserCode(Base):
    __tablename__ = "user_codes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    code = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)



# Créer les tables automatiquement au démarrage
if __name__ == "__main__":
    inspector = inspect(engine)

    # Vérifier si la table existe
    if "user_codes" in inspector.get_table_names():
        print("Table 'user_codes' existante trouvée. Suppression en cours...")
        UserCode.__table__.drop(engine)  # Supprimer la table 'user_codes'
    
    print("Création des tables...")
    Base.metadata.create_all(engine)
    print("Tables créées avec succès.")