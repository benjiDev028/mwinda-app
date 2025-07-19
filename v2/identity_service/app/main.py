from fastapi import FastAPI
from app.api.endpoints import register, auth , password , activateEmail , gestionUsers
import uvicorn
from starlette.middleware.cors import CORSMiddleware
from app.db.session import connect_to_db, close_db_connection
from app.db.base import Base
from app.db.session import engine
import os
from app.core.init_superadmin import create_superadmin

import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

app = FastAPI()

DATABASE_URL = "postgresql://mwinda:mwinda@localhost:5432/mwindaIdentity"

# Attendre que PostgreSQL soit prêt avant de se connecter
RETRY_COUNT = 10  # Nombre max de tentatives
SLEEP_TIME = 5    # Temps d'attente entre chaque tentative (en secondes)

engine = create_engine(DATABASE_URL)

# Fonction pour exécuter un script SQL
# Fonction pour exécuter un script SQL
from sqlalchemy import text

@app.on_event("startup")
async def startup_event():
    await create_superadmin()


def execute_sql_script(script_path):
    with open(script_path, "r") as file:
        sql_script = file.read()

    # Diviser le script en commandes individuelles
    commands = sql_script.split(';')

    try:
        with engine.connect() as connection:
            for command in commands:
                command = command.strip()

                # Ignorer les commentaires et les lignes vides
                if command and not command.startswith('--'):
                    # Utiliser `text()` pour encapsuler les commandes SQL
                    connection.execute(text(command))
            print("✅ Tables créées avec succès.")
    except OperationalError as e:
        print(f"❌ Erreur lors de l'exécution du script SQL : {e}")

# Exécution de la création des tables au démarrage de l'application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplacez "*" par l'URL de votre frontend React Native pour plus de sécurité
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Autorise tous les en-têtes
)



app.include_router(register.router, tags=["Register"])
app.include_router(auth.router, tags=["Auth"])
app.include_router(activateEmail.router , tags=['ActivateEmail'])
app.include_router(password.router, tags=["Password"])
app.include_router(gestionUsers.router , tags=["GestionUsers"])

@app.on_event("startup")
async def startup():
    app.state.db = await connect_to_db()
    # Exécuter le script de création des tables au démarrage
    script_path = os.path.join(os.path.dirname(__file__), 'create_tables.sql')
    #execute_sql_script(script_path)


@app.on_event("shutdown")
async def shutdown():
    await close_db_connection(app.state.db)

if __name__ == "__main__":
    
    uvicorn.run(app, host="192.168.2.13", port=8001)
