from django.urls import path
from .views import health, ping_task

urlpatterns = [
    path("health/", health, name="health"),
    path("celery-ping/", ping_task, name="celery_ping"),
]
