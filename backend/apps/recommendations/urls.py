from django.urls import path
from .views import listing_recommendations

urlpatterns = [
    path("listings/<uuid:listing_id>/recommendations/", listing_recommendations),
]
