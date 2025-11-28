from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import base64
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib import colors
from urllib.request import urlopen

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    category: str
    unit: Literal["KG", "Metre", "m²", "Adet"]
    unit_price: float
    package_kg: Optional[float] = None
    package_m2: Optional[float] = None
    package_length: Optional[float] = None
    package_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None  # base64 encoded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    code: str
    name: str
    category: str
    unit: Literal["KG", "Metre", "m²", "Adet"]
    unit_price: float
    package_kg: Optional[float] = None
    package_m2: Optional[float] = None
    package_length: Optional[float] = None
    package_count: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None

class QuoteItem(BaseModel):
    product_id: str
    product_name: str
    product_code: str
    product_image: Optional[str] = None
    unit: str
    quantity: float
    unit_price: float
    subtotal: float
    note: Optional[str] = None

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quote_number: str
    quote_date: datetime
    validity_date: datetime
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    currency: str
    items: List[QuoteItem]
    subtotal: float
    discount_type: Literal["percentage", "amount"]
    discount_value: float
    discount_amount: float
    vat_rate: float
    vat_amount: float
    total: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    quote_date: str
    validity_date: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    currency: str
    items: List[QuoteItem]
    discount_type: Literal["percentage", "amount"]
    discount_value: float
    vat_rate: float
    notes: Optional[str] = None

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    company_name: str
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[str] = None
    company_website: Optional[str] = None
    logo: Optional[str] = None
    default_currency: str = "EUR"
    default_vat_rate: float = 18.0
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

# Auth helpers
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user: UserRegister):
    existing_user = await db.users.find_one({"username": user.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_obj = User(
        username=user.username,
        password_hash=hash_password(user.password)
    )
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")

@api_router.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"username": user.username}, {"_id": 0})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")

# Product endpoints
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, current_user: str = Depends(get_current_user)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(current_user: str = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: str = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, current_user: str = Depends(get_current_user)):
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product['created_at'], str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: str = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Quote endpoints
@api_router.post("/quotes", response_model=Quote)
async def create_quote(quote: QuoteCreate, current_user: str = Depends(get_current_user)):
    # Get last quote number for this user
    last_quote = await db.quotes.find_one({"user_id": current_user}, {"_id": 0, "quote_number": 1}, sort=[("created_at", -1)])
    if last_quote and last_quote.get("quote_number"):
        last_num = int(last_quote["quote_number"].split("-")[-1])
        quote_number = f"FT-{last_num + 1:05d}"
    else:
        quote_number = "FT-00001"
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in quote.items)
    
    if quote.discount_type == "percentage":
        discount_amount = subtotal * (quote.discount_value / 100)
    else:
        discount_amount = quote.discount_value
    
    subtotal_after_discount = subtotal - discount_amount
    vat_amount = subtotal_after_discount * (quote.vat_rate / 100)
    total = subtotal_after_discount + vat_amount
    
    quote_obj = Quote(
        user_id=current_user,
        quote_number=quote_number,
        quote_date=datetime.fromisoformat(quote.quote_date),
        validity_date=datetime.fromisoformat(quote.validity_date),
        customer_name=quote.customer_name,
        customer_email=quote.customer_email,
        customer_phone=quote.customer_phone,
        currency=quote.currency,
        items=quote.items,
        subtotal=subtotal,
        discount_type=quote.discount_type,
        discount_value=quote.discount_value,
        discount_amount=discount_amount,
        vat_rate=quote.vat_rate,
        vat_amount=vat_amount,
        total=total,
        notes=quote.notes
    )
    
    doc = quote_obj.model_dump()
    doc['quote_date'] = doc['quote_date'].isoformat()
    doc['validity_date'] = doc['validity_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.quotes.insert_one(doc)
    return quote_obj

@api_router.get("/quotes", response_model=List[Quote])
async def get_quotes(current_user: str = Depends(get_current_user)):
    quotes = await db.quotes.find({"user_id": current_user}, {"_id": 0}).to_list(1000)
    for quote in quotes:
        if isinstance(quote['quote_date'], str):
            quote['quote_date'] = datetime.fromisoformat(quote['quote_date'])
        if isinstance(quote['validity_date'], str):
            quote['validity_date'] = datetime.fromisoformat(quote['validity_date'])
        if isinstance(quote['created_at'], str):
            quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    return quotes

@api_router.get("/quotes/{quote_id}", response_model=Quote)
async def get_quote(quote_id: str, current_user: str = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if isinstance(quote['quote_date'], str):
        quote['quote_date'] = datetime.fromisoformat(quote['quote_date'])
    if isinstance(quote['validity_date'], str):
        quote['validity_date'] = datetime.fromisoformat(quote['validity_date'])
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    return quote

@api_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str, current_user: str = Depends(get_current_user)):
    result = await db.quotes.delete_one({"id": quote_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}

@api_router.get("/quotes/{quote_id}/pdf")
async def get_quote_pdf(quote_id: str, current_user: str = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
    
    # Convert datetime strings
    if isinstance(quote['quote_date'], str):
        quote['quote_date'] = datetime.fromisoformat(quote['quote_date'])
    if isinstance(quote['validity_date'], str):
        quote['validity_date'] = datetime.fromisoformat(quote['validity_date'])
    
    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1e40af'), spaceAfter=12)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#374151'), spaceAfter=6)
    normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#4b5563'))
    
    # Logo and company info
    if settings and settings.get('logo'):
        try:
            logo_data = base64.b64decode(settings['logo'].split(',')[1] if ',' in settings['logo'] else settings['logo'])
            logo_img = RLImage(io.BytesIO(logo_data), width=3*cm, height=3*cm)
            story.append(logo_img)
        except:
            pass
    
    if settings:
        story.append(Paragraph(settings.get('company_name', 'Firma Adı'), title_style))
        if settings.get('company_address'):
            story.append(Paragraph(settings['company_address'], normal_style))
        info_parts = []
        if settings.get('company_phone'):
            info_parts.append(f"Tel: {settings['company_phone']}")
        if settings.get('company_email'):
            info_parts.append(f"E-posta: {settings['company_email']}")
        if settings.get('company_website'):
            info_parts.append(f"Web: {settings['company_website']}")
        if info_parts:
            story.append(Paragraph(" | ".join(info_parts), normal_style))
    
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("FİYAT TEKLİFİ", title_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Quote info
    info_data = [
        ["Teklif No:", quote['quote_number'], "Müşteri:", quote['customer_name']],
        ["Tarih:", quote['quote_date'].strftime('%d.%m.%Y'), "E-posta:", quote['customer_email']],
        ["Geçerlilik:", quote['validity_date'].strftime('%d.%m.%Y'), "Telefon:", quote.get('customer_phone', '-')]
    ]
    
    info_table = Table(info_data, colWidths=[3*cm, 5*cm, 3*cm, 5*cm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#6b7280')),
        ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#6b7280')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#111827')),
        ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#111827')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.5*cm))
    
    # Items table
    table_data = [['Ürün Adı', 'Ürün Kodu', 'Birim', 'Miktar', 'Birim Fiyat', 'Toplam']]
    for item in quote['items']:
        # Display text varsa onu kullan, yoksa sadece miktar
        quantity_display = item.get('display_text', str(item['quantity']))
        table_data.append([
            item['product_name'],
            item['product_code'],
            item['unit'],
            quantity_display,
            f"{item['unit_price']:.2f} {quote['currency']}",
            f"{item['subtotal']:.2f} {quote['currency']}"
        ])
    
    items_table = Table(table_data, colWidths=[5*cm, 3*cm, 2*cm, 2*cm, 3*cm, 3*cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.3*cm))
    
    # Totals
    totals_data = [
        ['Ara Toplam:', f"{quote['subtotal']:.2f} {quote['currency']}"]
    ]
    
    # İndirim varsa ekle
    if quote['discount_amount'] > 0:
        totals_data.append(['İndirim:', f"-{quote['discount_amount']:.2f} {quote['currency']}"])
    
    # KDV varsa ekle
    if quote['vat_amount'] > 0:
        totals_data.append(['KDV (%{:.0f})'.format(quote['vat_rate']), f"{quote['vat_amount']:.2f} {quote['currency']}"])
    
    totals_data.append(['GENEL TOPLAM:', f"{quote['total']:.2f} {quote['currency']}"])
    
    totals_table = Table(totals_data, colWidths=[13*cm, 3*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 2), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, 2), 9),
        ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 3), (-1, 3), 11),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.HexColor('#1e40af')),
        ('LINEABOVE', (0, 3), (-1, 3), 1.5, colors.HexColor('#1e40af')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(totals_table)
    
    if quote.get('notes'):
        story.append(Spacer(1, 0.5*cm))
        story.append(Paragraph("<b>Notlar:</b>", heading_style))
        story.append(Paragraph(quote['notes'], normal_style))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=teklif_{quote['quote_number']}.pdf"}
    )

# Settings endpoints
@api_router.get("/settings", response_model=Settings)
async def get_settings(current_user: str = Depends(get_current_user)):
    settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = Settings(
            company_name="Firma Adı",
            company_address="Firma Adresi",
            company_phone="+90 XXX XXX XX XX",
            company_email="info@firma.com",
            company_website="www.firma.com"
        )
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.settings.insert_one(doc)
        return default_settings
    
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_update: SettingsUpdate, current_user: str = Depends(get_current_user)):
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"id": "company_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()