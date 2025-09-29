import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Listing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    city = models.CharField(max_length=80)
    rooms = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.city})"

class Calendar(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="calendar")
    dt = models.DateField()
    min_nights = models.PositiveIntegerField(default=1)
    blocked = models.BooleanField(default=False)

    class Meta:
        unique_together = ("listing", "dt")
        indexes = [models.Index(fields=["listing", "dt"])]

class MarketSample(models.Model):
    city = models.CharField(max_length=80)
    dt = models.DateField()
    price = models.DecimalField(max_digits=8, decimal_places=2)      # average nightly rate
    occupancy = models.DecimalField(max_digits=5, decimal_places=2)  # 0..100 percentage
    n_listings = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("city", "dt")
        indexes = [models.Index(fields=["city", "dt"])]

class FeaturesDaily(models.Model):
    city = models.CharField(max_length=80)
    dt = models.DateField()
    is_holiday = models.BooleanField(default=False)
    event_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # 0..10

    holiday_name = models.CharField(max_length=120, blank=True, default="")
    avg_temp = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)   # °C
    precip_mm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # millimeters


    class Meta:
        unique_together = ("city", "dt")
        indexes = [models.Index(fields=["city", "dt"])]

class Override(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="overrides")
    dt = models.DateField()
    manual_price = models.DecimalField(max_digits=8, decimal_places=2)
    note = models.TextField(blank=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("listing", "dt")
        indexes = [models.Index(fields=["listing", "dt"])]
