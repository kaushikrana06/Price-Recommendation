# apps/llmcore/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .tasks import llm_generate_for_range

@api_view(["POST"])
def quote(request):
    """
    Body:
      {
        "listing_id": "<uuid>",
        "start": "YYYY-MM-DD",
        "end":   "YYYY-MM-DD"
      }
    Enqueues a Celery task and returns immediately.
    """
    listing_id = request.data.get("listing_id")
    start = request.data.get("start")
    end = request.data.get("end")

    if not listing_id:
        return Response({"detail": "listing_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not (start and end):
        return Response({"detail": "start and end are required (YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)

    llm_generate_for_range.delay(listing_id, start, end)
    return Response({"ok": True})
