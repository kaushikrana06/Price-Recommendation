#!/usr/bin/env bash
set -e

echo "Waiting for Postgres..."
python - <<'PY'
import os, time, psycopg
dsn = os.environ["DATABASE_URL"]
for _ in range(50):
    try:
        with psycopg.connect(dsn) as conn: pass
        break
    except Exception:
        time.sleep(0.5)
else:
    raise SystemExit("DB never became ready")
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput >/dev/null 2>&1 || true

if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ]; then
  python - <<'PY'
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE","config.settings")
import django; django.setup()
from django.contrib.auth import get_user_model

U = get_user_model()
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
pwd = os.environ.get("DJANGO_SUPERUSER_PASSWORD") or "admin"
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")

# Derive a sensible username from email if not supplied
if not username:
    username = (email.split("@", 1)[0] if email and "@" in email else "admin")

# Create if missing (by username, since default User uses username as the key)
if not U.objects.filter(username=username).exists():
    U.objects.create_superuser(username=username, email=email, password=pwd)
    print(f"Created superuser: {username} <{email}>")
else:
    print(f"Superuser already exists: {username}")
PY
fi


exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 90
