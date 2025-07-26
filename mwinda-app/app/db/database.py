from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import logging

# Configuration du logger SQLAlchemy
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

DATABASE_URL = settings.DATABASE_URL

# Configuration optimisée du moteur async
engine = create_async_engine(
    DATABASE_URL,
   
    pool_size=20,
    max_overflow=5,
    pool_timeout=30,
    pool_recycle=1800,  # Recyclage toutes les 30 minutes
    pool_pre_ping=True,  # Vérification des connexions
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

# Base des modèles
Base = declarative_base()

async def get_db():
    """Générateur de session avec gestion robuste des erreurs"""
    session = async_session()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()