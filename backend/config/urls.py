from django.contrib import admin
from django.urls import path, include
from apps.common.views import health, ping_task

urlpatterns = [
    path("admin/", admin.site.urls),

    # API-prefixed routes
    path("api/", include("apps.common.urls")),
    path("api/", include("apps.listings.urls")),
    path("api/", include("apps.recommendations.urls")),
    path("api/llm/", include("apps.llmcore.urls")),

    # Root-compat routes (works even if a proxy strips /api)
    path("", include("apps.listings.urls")),
    path("", include("apps.recommendations.urls")),

    # Root health endpoints we already added
    path("health/", health),
    path("celery-ping/", ping_task),
]
