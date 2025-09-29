from django.http import JsonResponse
from celery import shared_task

def health(request):
    return JsonResponse({"status": "ok", "service": "backend", "version": 1})

@shared_task
def _ping():
    return "pong"

def ping_task(request):
    task = _ping.delay()
    return JsonResponse({"task_id": task.id})
