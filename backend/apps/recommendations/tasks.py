# apps/recommendations/tasks.py
from datetime import date, timedelta
from typing import Dict, List, Tuple
from celery import shared_task
from django.db import transaction
from django.db.models import Avg

from apps.listings.models import Listing, MarketSample, FeaturesDaily
from .models import Recommendation


def _baseline_price(rooms: int, ms_price: float, occ: float, event_score: float, dow: int) -> float:
    base = ms_price * (1 + 0.08 * max(0, rooms - 1))
    base *= (1 + (occ - 65) / 300.0)
    if dow in (4, 5):  # Fri/Sat
        base *= 1.10
    base *= (1 + event_score / 50.0)
    return max(1000.0, min(base, ms_price * 2.0))


def _daterange(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def _fallback_market(city: str, target: date) -> Tuple[float, float, str]:
    """
    Try to derive a reasonable (price, occ) when there's no MarketSample for the exact date.
    Priority:
      1) average of up to last 14 days before target for this city
      2) average over all available rows for this city
      3) safe defaults (2500, 65)
    Returns (price, occ, reason_suffix)
    """
    recent = list(
        MarketSample.objects.filter(city=city, dt__lt=target)
        .order_by("-dt")[:14]
    )
    if recent:
        p = sum(float(r.price) for r in recent) / len(recent)
        o = sum(float(r.occupancy) for r in recent) / len(recent)
        return p, o, " (fallback: recent market avg)"

    agg = MarketSample.objects.filter(city=city).aggregate(
        price=Avg("price"), occ=Avg("occupancy")
    )
    if agg["price"] is not None:
        return float(agg["price"]), float(agg["occ"] or 65.0), " (fallback: city market avg)"

    return 2500.0, 65.0, " (fallback: defaults)"


@shared_task
def generate_recommendations_for_listing(listing_id: str, date_from: str, date_to: str, replace: bool = True):
    """
    Generate recommendations ONLY for the given listing and [date_from, date_to] inclusive (ISO yyyy-mm-dd).
    If `replace=True`, existing recs in that range for this listing are removed first.
    Uses recent/city averages as fallback when MarketSample rows are missing so the API never returns [].
    """
    # Parse & normalize dates
    start = date.fromisoformat(str(date_from))
    end = date.fromisoformat(str(date_to))
    if end < start:
        start, end = end, start

    listing = Listing.objects.get(id=listing_id)

    # Preload window rows
    ms_map: Dict[date, MarketSample] = {
        r.dt: r
        for r in MarketSample.objects.filter(city=listing.city, dt__range=(start, end))
    }
    ft_map: Dict[date, FeaturesDaily] = {
        r.dt: r
        for r in FeaturesDaily.objects.filter(city=listing.city, dt__range=(start, end))
    }

    recs: List[Recommendation] = []
    missing_exact_days = 0
    used_fallback_days = 0

    for d in _daterange(start, end):
        ms = ms_map.get(d)
        if ms is not None:
            ms_price = float(ms.price)
            occ = float(ms.occupancy)
            reason_extra = ""
        else:
            missing_exact_days += 1
            ms_price, occ, reason_extra = _fallback_market(listing.city, d)
            used_fallback_days += 1

        ft = ft_map.get(d)
        event_score = float(ft.event_score) if ft else 0.0

        price = _baseline_price(
            rooms=listing.rooms or 1,
            ms_price=ms_price,
            occ=occ,
            event_score=event_score,
            dow=d.weekday(),
        )

        recs.append(
            Recommendation(
                listing_id=listing.id,
                dt=d,
                rec_price=round(price, 2),
                conf_low=round(price * 0.9, 2),
                conf_high=round(price * 1.1, 2),
                reason="baseline: market + occupancy + weekend + events" + reason_extra,
            )
        )

    with transaction.atomic():
        if replace:
            Recommendation.objects.filter(
                listing_id=listing.id, dt__range=(start, end)
            ).delete()
        if recs:
            Recommendation.objects.bulk_create(recs, batch_size=500)

    return {
        "listing_id": str(listing.id),
        "from": start.isoformat(),
        "to": end.isoformat(),
        "created": len(recs),
        "missing_exact_market_days": missing_exact_days,
        "used_fallback_days": used_fallback_days,
    }
