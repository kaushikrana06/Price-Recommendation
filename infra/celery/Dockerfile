FROM python:3.12-slim
WORKDIR /app

# System packages (if needed later)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY backend/ /app/

# Environment (Django needs settings)
ENV DJANGO_SETTINGS_MODULE=config.settings

# Start Celery worker
CMD ["celery", "-A", "config", "worker", "-l", "info", "-Q", "celery", "--concurrency=12"]
