# Utiliser une image Python légère
FROM python:3.9

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement le fichier requirements.txt pour tirer parti du cache Docker
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier les fichiers de l'application dans le conteneur
COPY . .

# Ajouter un utilisateur non-root pour la sécurité
RUN useradd -ms /bin/bash appuser
USER appuser

# Exposer le port de l'application
EXPOSE 8002

# Commande d'entrée par défaut (modifiable dans docker-compose.yml)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
