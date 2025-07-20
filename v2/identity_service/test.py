from app.db.base import Base
from app.db.session import engine
from app.db.models import *  # assure-toi que tous les modèles sont bien importés

# Création des tables en mode synchrone
def init():
    Base.metadata.create_all(bind=engine)
    print("✅ Toutes les tables ont été créées avec succès.")

if __name__ == "__main__":
    init()
