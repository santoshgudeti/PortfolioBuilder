# ==========================================
# Stage 1: Build the Vite React Frontend
# ==========================================
FROM node:18-alpine AS frontend-build

WORKDIR /build/frontend

# Copy frontend source
COPY frontend/package*.json ./
RUN npm install

# Build frontend (Vite config is set to output to ../backend/static)
COPY frontend/ .
COPY .env .env
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

# Install python dependencies
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Since Vite built the frontend into `../backend/static` during stage 1,
# we need to grab that `static` folder from the frontend build context if it was local,
# OR we simply copy the result of the build.
# In our Dockerfile, `npm run build` created the directory `/build/backend/static` inside `frontend-build`.
COPY --from=frontend-build /build/backend/static /app/backend/static

# Expose backend port
EXPOSE 8000

# Make start script executable
RUN chmod +x start.sh

# Start app
CMD ["./start.sh"]
