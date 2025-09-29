from rest_framework import viewsets, mixins
from .models import Listing
from .serializers import ListingSerializer

class ListingViewSet(mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     viewsets.GenericViewSet):
    queryset = Listing.objects.all().order_by("created_at")
    serializer_class = ListingSerializer
