import os
import asyncpg
import uuid
from datetime import datetime
from app.core.security import get_password_hash

SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL")
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "admin123")
DATABASE_URL = os.getenv("DATABASE_URL")

async def create_superadmin():
    if not SUPERADMIN_EMAIL:
        print("[ERREUR] SUPERADMIN_EMAIL est manquant dans les variables d'environnement.")
        return

    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Vérifie s’il existe déjà un superadmin ou un utilisateur avec cet email
        existing = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE role = $1 OR email = $2",
            "superadmin", SUPERADMIN_EMAIL
        )
        if existing == 0:
            print("[INFO] Aucune entrée superadmin trouvée. Création du superadmin...")
            hashed_password, salt = get_password_hash(SUPERADMIN_PASSWORD)
            await conn.execute("""
                INSERT INTO users (
                    id, first_name, last_name, email,
                    password_hash, password_salt,
                    date_birth, is_email_verified, role
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """,
            uuid.uuid4(),
            "Super",
            "Admin",
            SUPERADMIN_EMAIL,
            hashed_password,
            salt,
            "9088",
            True,
            "superadmin"
            )
            print(f"[✔] Superadmin créé : {SUPERADMIN_EMAIL}")
        else:
            print(f"[INFO] Superadmin déjà présent ou email déjà utilisé.")
    except Exception as e:
        print(f"[ERREUR] Création du superadmin a échoué : {e}")
    finally:
        await conn.close()
