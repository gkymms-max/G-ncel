from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone
import uuid

class QuoteItem(BaseModel):
    product_id: str
    product_name: str
    unit: str
    quantity: float
    unit_price: float
    subtotal: float
    display_text: Optional[str] = None

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_number: str
    user_id: str
    customer_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    customer_company: Optional[str] = None
    items: List[QuoteItem]
    subtotal: float
    discount_rate: float = 0
    discount_amount: float = 0
    vat_rate: float
    vat_amount: float
    vat_type: Literal["included", "excluded"] = "excluded"
    total: float
    currency: str
    notes: Optional[str] = None
    quote_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    validity_date: datetime
    status: Literal["draft", "pending", "approved", "rejected"] = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    customer_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    customer_company: Optional[str] = None
    items: List[QuoteItem]
    subtotal: float
    discount_rate: float = 0
    discount_amount: float = 0
    vat_rate: float
    vat_amount: float
    vat_type: Literal["included", "excluded"] = "excluded"
    total: float
    currency: str
    notes: Optional[str] = None
    validity_date: datetime
    status: Literal["draft", "pending", "approved", "rejected"] = "draft"
