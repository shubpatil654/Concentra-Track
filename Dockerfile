# Multi-stage Dockerfile for ConcentraTrack

# Stage 1: Python Flask Backend
FROM python:3.9-slim as flask-backend

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask application
COPY app.py .
COPY src/ ./src/

# Expose Flask port
EXPOSE 5000

# Stage 2: Node.js Backend (Alternative)
FROM node:18-alpine as node-backend

WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Node.js application
COPY server.js .
COPY index.html .
COPY styles.css .
COPY script.js .

# Expose Node.js port
EXPOSE 3000

# Stage 3: Production (Choose one backend)
FROM python:3.9-slim as production

WORKDIR /app

# Copy Python dependencies and app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY src/ ./src/
COPY index.html .
COPY styles.css .
COPY script.js .
COPY README.md .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["python", "app.py"]