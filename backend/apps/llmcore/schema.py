from typing import List
from pydantic import BaseModel, Field, ValidationError, confloat

class DayQuote(BaseModel):
    dt: str  # YYYY-MM-DD
    price: confloat(gt=0)      # type: ignore[arg-type]
    conf_low: confloat(gt=0)   # type: ignore[arg-type]
    conf_high: confloat(gt=0)  # type: ignore[arg-type]
    rationale: str = Field(default="", max_length=500)
    flags: List[str] = Field(default_factory=list)

class QuoteResponse(BaseModel):
    listing_id: str
    horizon_days: int
    currency: str = "INR"
    days: List[DayQuote] = Field(min_items=1)  # <-- v2 style constraint
    model_version: str = "llm_v1"
