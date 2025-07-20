from app.core.security import  verify_password, create_access_token , create_refresh_token
from app.db.schemas.user import UserCreate
from asyncpg import Connection
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from sqlalchemy import select
import traceback
from sqlalchemy.orm import selectinload


async def login_user(db: AsyncSession, email: str, password: str) -> str:
    """
    Authentifie un utilisateur et génère un token JWT.
    """
    # Recherche de l'utilisateur par email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash, user.password_salt):

        return "Information Invalide"

    # Création du token JWT
    # Création du token JWT
    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": user.role  # Correctement accéder au rôle de l'utilisateur
    }
    return create_access_token(data=token_data) , create_refresh_token(data= token_data)
