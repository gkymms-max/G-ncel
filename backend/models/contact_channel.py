from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

class ContactChannel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["whatsapp", "instagram", "facebook", "tiktok", "website"]
    title: str
    value: str
    icon: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactChannelCreate(BaseModel):
    type: Literal["whatsapp", "instagram", "facebook", "tiktok", "website"]
    title: str
    value: str
    icon: Optional[str] = None
