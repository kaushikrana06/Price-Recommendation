from datetime import date, timedelta
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from apps.listings.models import Listing
from apps.recommendations.models import Recommendation
from apps.recommendations.tasks import generate_recommendations_for_listing


@api_view(["GET"])
def listing_recommendations(request, listing_id):
    # Validate listing exists (return 404 early if not)
    try:
        listing = Listing.objects.only("id").get(id=listing_id)
    except Listing.DoesNotExist:
        return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    # Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD
    start = parse_date(request.query_params.get("from")) or date.today()
    end = parse_date(request.query_params.get("to")) or (start + timedelta(days=14))
    if end < start:
        start, end = end, start

    expected_days = (end - start).days + 1

    # See what we already have
    qs = Recommendation.objects.filter(listing_id=listing.id, dt__range=(start, end)).order_by("dt")
    have = qs.count()

    # If any day is missing in the requested window, generate JUST this window for THIS listing
    if have < expected_days:
        generate_recommendations_for_listing.run(str(listing.id), start.isoformat(), end.isoformat(), replace=True)
        qs = Recommendation.objects.filter(listing_id=listing.id, dt__range=(start, end)).order_by("dt")

    # Inline serialization (simple & fast)
    data = [
        {
            "dt": r.dt.isoformat(),
            "rec_price": float(r.rec_price),
            "conf_low": float(r.conf_low),
            "conf_high": float(r.conf_high),
            "reason": r.reason,
        }
        for r in qs
    ]
    return Response(data)
