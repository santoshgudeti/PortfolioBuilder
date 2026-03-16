#!/bin/bash
set -e

echo "Running database migrations..."
python migrate_prod_pg.py

echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
