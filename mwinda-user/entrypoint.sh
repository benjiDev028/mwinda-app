#!/usr/bin/env sh
set -eu

echo "✅ Starting User Service entrypoint..."

# --- Required environment variables ---
: "${DATABASE_URL:?DATABASE_URL is not set}"

# Optional RabbitMQ URL
RABBITMQ_URL="${RABBITMQ_URL:-}"

# --- Configuration ---
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
LOCK_KEY="${MIGRATION_LOCK_KEY:-987654321}"
DB_WAIT_SECONDS="${DB_WAIT_SECONDS:-60}"
RABBIT_WAIT_SECONDS="${RABBIT_WAIT_SECONDS:-60}"
MAX_RETRIES="${MIGRATION_MAX_RETRIES:-30}"
SLEEP_SECONDS="${MIGRATION_RETRY_SLEEP:-2}"

# Convert async URL to sync URL for SQLAlchemy
export SYNC_DB_URL="$(echo "$DATABASE_URL" | sed 's/postgresql+asyncpg/postgresql+psycopg/g')"
export LOCK_KEY
export DB_WAIT_SECONDS
export RABBITMQ_URL
export RABBIT_WAIT_SECONDS

# ---------------------------
# 1) Wait for PostgreSQL
# ---------------------------
echo "⏳ Waiting for PostgreSQL..."
python - <<'PY'
import os, time, sys
import sqlalchemy as sa
from sqlalchemy import text

url = os.environ["SYNC_DB_URL"]
wait_s = int(os.environ.get("DB_WAIT_SECONDS", "60"))

engine = sa.create_engine(url, pool_pre_ping=True)
deadline = time.time() + wait_s

while True:
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        print("✅ PostgreSQL is ready.")
        sys.exit(0)
    except Exception as e:
        if time.time() > deadline:
            print(f"❌ PostgreSQL not ready in time: {e}")
            sys.exit(1)
        time.sleep(2)
PY

# ---------------------------
# 2) Wait for RabbitMQ
# ---------------------------
if [ -n "$RABBITMQ_URL" ]; then
  echo "⏳ Waiting for RabbitMQ..."
  python - <<'PY'
import os, time, socket, sys
from urllib.parse import urlparse

url = os.environ.get("RABBITMQ_URL", "")
wait_s = int(os.environ.get("RABBIT_WAIT_SECONDS", "60"))

# Default RabbitMQ connection
host = "rabbitmq"
port = 5672

# Parse URL if provided
if url:
    try:
        u = urlparse(url)
        if u.hostname:
            host = u.hostname
        if u.port:
            port = u.port
    except Exception:
        pass

deadline = time.time() + wait_s
while True:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3)
        s.connect((host, port))
        s.close()
        print("✅ RabbitMQ is ready.")
        sys.exit(0)
    except Exception as e:
        if time.time() > deadline:
            print(f"❌ RabbitMQ not ready in time: {e}")
            sys.exit(1)
        time.sleep(2)
PY
else
  echo "⚠️ RABBITMQ_URL not set => skipping RabbitMQ wait."
fi

# ---------------------------
# 3) Run Migrations with Advisory Lock
# ---------------------------
if [ "$RUN_MIGRATIONS" = "1" ]; then
  echo "🔒 Acquiring advisory lock $LOCK_KEY..."
  python - <<'PY'
import os
import sqlalchemy as sa
from sqlalchemy import text

lock_key = int(os.environ["LOCK_KEY"])
url = os.environ["SYNC_DB_URL"]
engine = sa.create_engine(url, pool_pre_ping=True)

with engine.begin() as conn:
    conn.execute(text("SELECT pg_advisory_lock(:k)"), {"k": lock_key})
    print("✅ Lock acquired.")
PY

  echo "🚀 Running migrations with retry logic..."
  i=1
  while [ $i -le "$MAX_RETRIES" ]; do
    if alembic upgrade head; then
      echo "✅ Migrations completed successfully"
      break
    fi
    echo "⚠️ Migrations failed, retrying... ($i/$MAX_RETRIES)"
    i=$((i+1))
    sleep "$SLEEP_SECONDS"
  done

  if [ $i -gt "$MAX_RETRIES" ]; then
    echo "❌ Migrations failed after $MAX_RETRIES retries"
    exit 1
  fi

  echo "🔓 Releasing advisory lock..."
  python - <<'PY'
import os
import sqlalchemy as sa
from sqlalchemy import text

lock_key = int(os.environ["LOCK_KEY"])
url = os.environ["SYNC_DB_URL"]
engine = sa.create_engine(url, pool_pre_ping=True)

with engine.begin() as conn:
    conn.execute(text("SELECT pg_advisory_unlock(:k)"), {"k": lock_key})
    print("✅ Lock released.")
PY
else
  echo "⚠️ RUN_MIGRATIONS=$RUN_MIGRATIONS => skipping migrations."
fi

# ---------------------------
# 4) Start API Server
# ---------------------------
echo "🚀 Starting User Service API on port 8003..."

if [ "${UVICORN_RELOAD:-0}" = "1" ]; then
  echo "🔄 Development mode: Hot reload enabled"
  exec uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
else
  echo "🏭 Production mode: Hot reload disabled"
  exec uvicorn app.main:app --host 0.0.0.0 --port 8003
fi