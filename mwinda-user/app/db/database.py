from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool  # Ajout important
from app.core.config import settings

import logging

# Configuration du logger pour SQLAlchemy
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

DATABASE_URL = settings.DATABASE_URL

# Configuration améliorée du moteur async
engine = create_async_engine(
    DATABASE_URL,
    pool_size=15,
    max_overflow=5,
    pool_timeout=30,
    pool_recycle=3600,  # Recycler les connexions après 1 heure
    pool_pre_ping=True,  # Vérifie que la connexion est vivante avant utilisation
    echo=False,
    future=True
)

# Configuration de la session async
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()

async def get_db():
    """Générateur de session avec gestion propre des ressources"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()  # Commit si tout se passe bien
        except Exception:
            await session.rollback()  # Rollback en cas d'erreur
            raise
        finally:
            await session.close()  # Fermeture garantie de la session