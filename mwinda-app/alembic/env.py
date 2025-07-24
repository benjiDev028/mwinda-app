import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

# Configuration Alembic
config = context.config

# Configurer le logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# URL de la base de données
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env file")
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Import ABSOLU de tous vos modèles
from app.db.models import Base, LoyaltyHistory  # Ajoutez tous vos modèles
from app.db.base import Base as BaseModel  # Si vous avez un base.py séparé

# Assurez-vous que toutes les métadonnées sont chargées
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
        echo=True,
    )

    async with connectable.connect() as connection:
        try:
            await connection.run_sync(
                lambda sync_conn: context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    compare_type=True,
                )
            )
            async with connection.begin() as trans:
                await connection.run_sync(lambda conn: context.run_migrations())
                await trans.commit()
                print("Migration committed successfully!")
        except Exception as e:
            print(f"Migration failed: {str(e)}")
            raise
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())