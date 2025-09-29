import os
from pathlib import Path
import environ
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, "dev-secret-key"),
    ALLOWED_HOSTS=(list, ["*"]),
    DATABASE_URL=(str, "postgres://postgres:postgres@localhost:5432/pricing"),
    REDIS_URL=(str, "redis://localhost:6379/0"),
    CORS_ALLOWED_ORIGINS=(list, ["http://localhost"]),
)
# read project root .env (one directory up from backend/)
env_path = BASE_DIR.parent / ".env"
if env_path.exists():
    environ.Env.read_env(str(env_path))

DEBUG = env.bool("DEBUG")
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.common",
    "apps.listings",
    "apps.recommendations",
     "apps.llmcore",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": env.db("DATABASE_URL")
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny"
    ],
}

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True

CELERY_BROKER_URL = env("REDIS_URL")
CELERY_RESULT_BACKEND = env("REDIS_URL")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    "gen-recs-daily": {
        "task": "apps.recommendations.tasks.generate_recommendations",
        "schedule": timedelta(hours=24),
        "args": (30,),
    }
}
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

EXPEDIA_GRAPHQL_URL = os.getenv("EXPEDIA_GRAPHQL_URL", "https://www.expedia.co.in/graphql")
EXPEDIA_CLIENT_INFO = os.getenv("EXPEDIA_CLIENT_INFO", "shopping-pwa,us-west-2")
EXPEDIA_COOKIE = os.getenv("EXPEDIA_COOKIE", "")
EXPEDIA_UA = os.getenv("EXPEDIA_UA", "Mozilla/5.0 ... Safari/537.36")
EXPEDIA_SITE_ID = int(os.getenv("EXPEDIA_SITE_ID", "27"))
EXPEDIA_LOCALE = os.getenv("EXPEDIA_LOCALE", "en_GB")
EXPEDIA_CURRENCY = os.getenv("EXPEDIA_CURRENCY", "INR")
EXPEDIA_PERSISTED_HASH = os.getenv("EXPEDIA_PERSISTED_HASH", "835f02981ed875d25c55a4d7781756ab283ec3bbabbdfe3a997ea5e635e5212f")
EXPEDIA_REGION_ID = os.getenv("EXPEDIA_REGION_ID", "178293")
EXPEDIA_LAT = os.getenv("EXPEDIA_LAT", "40.75668")
EXPEDIA_LON = os.getenv("EXPEDIA_LON", "-73.98647")
EXPEDIA_RATE_DELAY_S = os.getenv("EXPEDIA_RATE_DELAY_S", "1.0")