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

# Public, build-time-only config for the client bundle. Vite inlines these
# into the shipped JS regardless of how they're supplied, so only pass
# values that are already meant to be public here — never backend secrets.
ARG VITE_API_URL=/api
ARG VITE_APP_DOMAIN
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_DOMAIN=$VITE_APP_DOMAIN \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

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

# Make start script executable
RUN chmod +x start.sh

# Run as a non-root user
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/backend/uploads \
    && chown -R appuser:appuser /app
USER appuser

# Expose backend port
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import os,urllib.request as u; port=os.environ.get('PORT','8000'); u.urlopen(f'http://127.0.0.1:{port}/health', timeout=3)"

# Start app
CMD ["./start.sh"]
