# ==========================================
# Stage 1: Build the Vite React Frontend
# ==========================================
FROM node:18-alpine AS frontend-build

WORKDIR /build/frontend

# Copy frontend source
COPY frontend/package*.json ./
RUN npm install

# Build frontend into dist/
COPY frontend/ .
COPY .env .env
# Since the backend will serve the frontend from the exact same origin,
# VITE_API_URL can just default to /api internally, but pass an empty build arg if needed.
RUN npm run build

# ==========================================
# Stage 2: Build the FastAPI Backend
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Set python environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies inside the backend folder context
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy built frontend assets to where the backend expects them
# Important: FastAPI is looking for `../frontend/dist` relative to `main.py`
# since we set workdir to `/app/backend`, `../frontend/dist` resolves to `/app/frontend/dist`
COPY --from=frontend-build /build/frontend/dist /app/frontend/dist

# Expose backend port
EXPOSE 8000

# Start app
# (Running uvicorn from the /app/backend directory so module imports work correctly)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
