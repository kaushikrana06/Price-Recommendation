from django.db import models

class Recommendation(models.Model):
    listing_id = models.UUIDField()
    dt = models.DateField()
    rec_price = models.DecimalField(max_digits=8, decimal_places=2)
    conf_low = models.DecimalField(max_digits=8, decimal_places=2)
    conf_high = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("listing_id", "dt")
        indexes = [models.Index(fields=["listing_id", "dt"])]
