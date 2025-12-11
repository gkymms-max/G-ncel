from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    category: str
    unit: Literal["KG", "Metre", "m²", "Adet"]
    unit_price: float
    currency: str = "EUR"
    package_kg: Optional[float] = None
    package_m2: Optional[float] = None
    package_length: Optional[float] = None
    package_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    code: str
    name: str
    category: str
    unit: Literal["KG", "Metre", "m²", "Adet"]
    unit_price: float
    currency: str = "EUR"
    package_kg: Optional[float] = None
    package_m2: Optional[float] = None
    package_length: Optional[float] = None
    package_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None

class ProductUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[Literal["KG", "Metre", "m²", "Adet"]] = None
    unit_price: Optional[float] = None
    currency: Optional[str] = None
    package_kg: Optional[float] = None
    package_m2: Optional[float] = None
    package_length: Optional[float] = None
    package_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None
