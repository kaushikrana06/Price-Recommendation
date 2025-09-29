# apps/llmcore/price.py
import os, json, logging
from datetime import date, datetime, timedelta
from django.db import transaction
from openai import OpenAI

from apps.listings.models import Listing, FeaturesDaily
from apps.recommendations.models import Recommendation

log = logging.getLogger(__name__)

def _daterange(d0: date, d1: date):
    cur = d0
    while cur <= d1:
        yield cur
        cur += timedelta(days=1)

def _features(city: str, d: date):
    """
    Pull a minimal feature set for the LLM. Falls back to neutral values.
    """
    f = FeaturesDaily.objects.filter(city=city, dt=d).values(
        "event_score", "is_holiday"
    ).first()
    return f or {"event_score": 0.0, "is_holiday": False}

def _prompt(city: str, d_iso: str, feats: dict) -> str:
    return (
        "You are an expert hotel/Airbnb pricing analyst.\n"
        f"City: {city}\n"
        f"Date: {d_iso}\n"
        f"Signals: event_score={feats['event_score']}, is_holiday={feats['is_holiday']}\n"
        "Return STRICT JSON object with keys: price, low, high, reason. "
        "Numbers should be floats in INR."
    )

def _call_openai(prompt: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    client = OpenAI(api_key=api_key)
    rsp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return json.loads(rsp.choices[0].message.content)

def _write_row(listing_id, d: date, price: float, low: float, high: float, reason: str):
    Recommendation.objects.update_or_create(
        listing_id=listing_id,
        dt=d,
        defaults=dict(
            rec_price=price,
            conf_low=low,
            conf_high=high,
            reason=reason,
        ),
    )

def generate_llm_prices_range(listing_id: str, start: str, end: str):
    """
    Generate and upsert LLM prices for [start, end] inclusive.
    """
    listing = Listing.objects.get(id=listing_id)
    d0 = datetime.strptime(start, "%Y-%m-%d").date()
    d1 = datetime.strptime(end, "%Y-%m-%d").date()
    if d1 < d0:
        d0, d1 = d1, d0

    rows = 0
    with transaction.atomic():
        for d in _daterange(d0, d1):
            feats = _features(listing.city, d)
            data = _call_openai(_prompt(listing.city, d.isoformat(), feats))

            # Defensive casting (LLMs sometimes return strings)
            price = float(data.get("price") or data.get("rec_price"))
            low   = float(data.get("low")   or data.get("conf_low")  or price * 0.9)
            high  = float(data.get("high")  or data.get("conf_high") or price * 1.1)
            reason = data.get("reason", "LLM generated")

            _write_row(listing_id, d, price, low, high, reason)
            rows += 1

    log.info(
        "LLM range write complete listing=%s start=%s end=%s rows=%s",
        listing_id, d0, d1, rows
    )

def generate_llm_prices(listing_id: str, days_ahead: int = 7):
    """
    Backwards-compatible helper: today -> today+days_ahead-1
    """
    today = date.today()
    end = today + timedelta(days=max(0, int(days_ahead) - 1))
    return generate_llm_prices_range(listing_id, today.isoformat(), end.isoformat())
