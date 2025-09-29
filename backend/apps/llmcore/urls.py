from django.urls import path
from .views import quote

urlpatterns = [
    path("quote/", quote, name="llm-quote"),
]
