SYSTEM = """You are a pricing strategist for short-term rentals.
Decide nightly prices which maximize revenue while staying competitive.
ALWAYS return STRICT JSON which matches the provided schema exactly. No prose."""

USER_TEMPLATE = """Context:
- Listing: {title}, city: {city}, rooms: {rooms}
- Market avg price (today): {market_price}
- Market occupancy (today): {occupancy}%
- Weekend today? {is_weekend}
- Holiday: {holiday_name}
- Event score today: {event_score}
- Weather: avg temp {avg_temp}°C, precip {precip_mm}mm
- Top {k} semantic comps (sample): {comps}

Task:
Propose prices for the next {horizon} days.
Return JSON ONLY:
{{
  "listing_id": "{listing_id}",
  "horizon_days": {horizon},
  "currency": "INR",
  "days": [
    {{"dt": "YYYY-MM-DD", "price": 0, "conf_low": 0, "conf_high": 0, "rationale": "", "flags": []}}
  ],
  "model_version": "llm_v1"
}}

Rules:
- conf_low <= price <= conf_high
- Keep prices within 0.5x..2.0x of city market avg unless strongly justified (then add a "flag")
- Use demand signals (occupancy, weekend/holiday, events, weather) sensibly
"""
