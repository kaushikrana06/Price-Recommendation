import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.listings.models import Listing, Calendar, MarketSample, FeaturesDaily

CITIES = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai", "Goa"]
N_LISTINGS = 20
DAYS = 180

class Command(BaseCommand):
    help = "Seed demo data: listings, calendar, market samples, features"

    def handle(self, *args, **kwargs):
        random.seed(42)
        today = date.today()
        start = today - timedelta(days=30)
        end = today + timedelta(days=DAYS)

        with transaction.atomic():
            # listings
            if Listing.objects.count() < N_LISTINGS:
                for i in range(N_LISTINGS):
                    city = random.choice(CITIES)
                    rooms = random.randint(1, 4)
                    Listing.objects.create(
                        title=f"Demo Listing {i+1}",
                        city=city,
                        rooms=rooms,
                    )
            self.stdout.write(self.style.SUCCESS(f"Listings: {Listing.objects.count()}"))

            # calendar
            for listing in Listing.objects.all():
                cals = []
                for d in (start + timedelta(n) for n in range((end-start).days+1)):
                    cals.append(Calendar(listing=listing, dt=d, min_nights=1, blocked=False))
                Calendar.objects.filter(listing=listing, dt__range=(start, end)).delete()
                Calendar.objects.bulk_create(cals, batch_size=1000)

            # market samples + features
            MarketSample.objects.filter(dt__range=(start, end)).delete()
            FeaturesDaily.objects.filter(dt__range=(start, end)).delete()
            ms_bulk, ft_bulk = [], []
            for city in CITIES:
                base = random.randint(2000, 5000)  # INR (or use your currency)
                for n in range((end-start).days+1):
                    d = start + timedelta(n)
                    dow = d.weekday()
                    wkd = 1.15 if dow in (4,5) else 1.0  # weekend uplift
                    price = int(base * wkd * random.uniform(0.9, 1.1))
                    occ = int(65 * wkd * random.uniform(0.85, 1.15))
                    ms_bulk.append(MarketSample(city=city, dt=d, price=price, occupancy=min(100, max(30, occ)), n_listings=500))
                    # holidays/events: a small spike every ~30 days
                    is_holiday = (n % 30 == 0)
                    event_score = 3.0 if is_holiday else (1.0 if dow in (4,5) else 0.0)
                    ft_bulk.append(FeaturesDaily(city=city, dt=d, is_holiday=is_holiday, event_score=event_score))
            MarketSample.objects.bulk_create(ms_bulk, batch_size=2000)
            FeaturesDaily.objects.bulk_create(ft_bulk, batch_size=2000)

        self.stdout.write(self.style.SUCCESS("Seeded demo data."))
