from rest_framework import serializers
from .models import Recommendation

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ["listing_id", "dt", "rec_price", "conf_low", "conf_high", "reason", "created_at"]
