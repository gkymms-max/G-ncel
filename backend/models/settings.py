from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[str] = None
    company_website: Optional[str] = None
    logo: Optional[str] = None
    default_currency: str = "EUR"
    default_vat_rate: float = 20.0
    pdf_theme: Literal["blue", "green", "purple", "orange"] = "blue"
    ui_theme: Literal["light", "dark"] = "light"
    theme_color: Optional[str] = "#4F46E5"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[str] = None
    company_website: Optional[str] = None
    logo: Optional[str] = None
    default_currency: Optional[str] = None
    default_vat_rate: Optional[float] = None
    pdf_theme: Optional[Literal["blue", "green", "purple", "orange"]] = None
    ui_theme: Optional[Literal["light", "dark"]] = None
    theme_color: Optional[str] = None
