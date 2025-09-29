# apps/llmcore/tasks.py
from celery import shared_task
from .price import generate_llm_prices, generate_llm_prices_range

@shared_task(name="apps.llmcore.tasks.llm_generate_recommendations")
def llm_generate_recommendations(days_ahead: int = 7):
    """
    Existing helper: generates prices for *all* listings, days ahead from today.
    """
    from apps.listings.models import Listing
    for lid in Listing.objects.values_list("id", flat=True):
        generate_llm_prices(str(lid), days_ahead=days_ahead)
    return "ok"

@shared_task(name="apps.llmcore.tasks.llm_generate_for_range")
def llm_generate_for_range(listing_id: str, start: str, end: str):
    """
    NEW: Generate LLM prices for one listing between [start, end] (YYYY-MM-DD).
    """
    generate_llm_prices_range(listing_id, start, end)
    return "ok"
