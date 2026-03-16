#!/bin/bash
set -e

echo "Running database migrations..."
python -m alembic upgrade head

# Starting FastAPI server (using PORT env var if available for cloud providers)
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips "*"
