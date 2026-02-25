from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum
import hashlib
import hmac
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="PROGET ALIMENTATION API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ProductCategory(str, Enum):
    RIZ = "riz"
    LAIT = "lait"
    HUILE = "huile"
    SUCRE = "sucre"
    CEREALES = "cereales"
    PATES = "pates"
    AUTRES = "autres"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Pydantic Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_bambara: Optional[str] = None
    category: ProductCategory
    price_euro: float
    price_cfa: int
    weight: Optional[str] = None
    description: Optional[str] = None
    description_bambara: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_available: bool = True
    is_promotion: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    name_bambara: Optional[str] = None
    category: ProductCategory
    price_euro: float
    price_cfa: int
    weight: Optional[str] = None
    description: Optional[str] = None
    description_bambara: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_available: bool = True
    is_promotion: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_bambara: Optional[str] = None
    category: Optional[ProductCategory] = None
    price_euro: Optional[float] = None
    price_cfa: Optional[int] = None
    weight: Optional[str] = None
    description: Optional[str] = None
    description_bambara: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None
    is_promotion: Optional[bool] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price_euro: float
    price_cfa: int

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    customer_address: str
    items: List[OrderItem]
    total_euro: float
    total_cfa: int
    status: OrderStatus = OrderStatus.PENDING
    notes: Optional[str] = None
    is_wholesale: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    customer_address: str
    items: List[OrderItem]
    notes: Optional[str] = None
    is_wholesale: bool = False

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    subject: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    subject: str
    message: str

class DashboardStats(BaseModel):
    total_products: int
    total_orders: int
    pending_orders: int
    total_revenue_euro: float
    total_revenue_cfa: int
    low_stock_count: int
    unread_contacts: int

# Helper function to serialize datetime
def serialize_doc(doc: dict) -> dict:
    if 'created_at' in doc and isinstance(doc['created_at'], datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    if 'updated_at' in doc and isinstance(doc['updated_at'], datetime):
        doc['updated_at'] = doc['updated_at'].isoformat()
    return doc

def deserialize_doc(doc: dict) -> dict:
    if 'created_at' in doc and isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if 'updated_at' in doc and isinstance(doc['updated_at'], str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    return doc

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur PROGET ALIMENTATION API", "version": "1.0.0"}

# ===================== PRODUCTS =====================

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[ProductCategory] = None,
    available_only: bool = False,
    promotion_only: bool = False
):
    query = {}
    if category:
        query["category"] = category
    if available_only:
        query["is_available"] = True
    if promotion_only:
        query["is_promotion"] = True
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        deserialize_doc(p)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    deserialize_doc(product)
    return product

@api_router.post("/products", response_model=Product)
async def create_product(input: ProductCreate):
    product = Product(**input.model_dump())
    doc = product.model_dump()
    serialize_doc(doc)
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    deserialize_doc(updated)
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return {"message": "Produit supprimé"}

# ===================== ORDERS =====================

@api_router.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[OrderStatus] = None):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for o in orders:
        deserialize_doc(o)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    deserialize_doc(order)
    return order

@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate):
    # Calculate totals
    total_euro = sum(item.price_euro * item.quantity for item in input.items)
    total_cfa = sum(item.price_cfa * item.quantity for item in input.items)
    
    order = Order(
        **input.model_dump(),
        total_euro=round(total_euro, 2),
        total_cfa=total_cfa
    )
    doc = order.model_dump()
    serialize_doc(doc)
    await db.orders.insert_one(doc)
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus):
    existing = await db.orders.find_one({"id": order_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    await db.orders.update_one(
        {"id": order_id}, 
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": f"Statut mis à jour: {status}"}

# ===================== CONTACTS =====================

@api_router.get("/contacts", response_model=List[Contact])
async def get_contacts(unread_only: bool = False):
    query = {}
    if unread_only:
        query["is_read"] = False
    contacts = await db.contacts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for c in contacts:
        deserialize_doc(c)
    return contacts

@api_router.post("/contacts", response_model=Contact)
async def create_contact(input: ContactCreate):
    contact = Contact(**input.model_dump())
    doc = contact.model_dump()
    serialize_doc(doc)
    await db.contacts.insert_one(doc)
    return contact

@api_router.put("/contacts/{contact_id}/read")
async def mark_contact_read(contact_id: str):
    result = await db.contacts.update_one({"id": contact_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return {"message": "Marqué comme lu"}

# ===================== DASHBOARD =====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    low_stock = await db.products.count_documents({"stock_quantity": {"$lt": 10}})
    unread_contacts = await db.contacts.count_documents({"is_read": False})
    
    # Calculate revenue
    orders = await db.orders.find({"status": {"$ne": "cancelled"}}, {"_id": 0}).to_list(10000)
    total_euro = sum(o.get("total_euro", 0) for o in orders)
    total_cfa = sum(o.get("total_cfa", 0) for o in orders)
    
    return DashboardStats(
        total_products=total_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        total_revenue_euro=round(total_euro, 2),
        total_revenue_cfa=total_cfa,
        low_stock_count=low_stock,
        unread_contacts=unread_contacts
    )

# ===================== SEED DATA =====================

@api_router.post("/seed")
async def seed_data():
    # Check if products already exist
    existing = await db.products.count_documents({})
    if existing > 0:
        return {"message": "Données déjà présentes", "count": existing}
    
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Riz Royal",
            "name_bambara": "Malo Royal",
            "category": "riz",
            "price_euro": 46,
            "price_cfa": 30000,
            "weight": "25 kg",
            "description": "Riz de qualité supérieure, grain long et parfumé",
            "description_bambara": "Malo ɲuman, a ka jan ani a ka diya",
            "image_url": "https://images.unsplash.com/photo-1714070707310-b3737ff0a0fb?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock_quantity": 50,
            "is_available": True,
            "is_promotion": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Riz Parfumé",
            "name_bambara": "Malo ka diya",
            "category": "riz",
            "price_euro": 43,
            "price_cfa": 28000,
            "weight": "25 kg",
            "description": "Riz parfumé importé, idéal pour tous vos plats",
            "description_bambara": "Malo min ka diya kosɛbɛ",
            "image_url": "https://images.unsplash.com/photo-1633536706496-873ce0d46277?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock_quantity": 35,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Riz Gambiyaga",
            "name_bambara": "Malo Gambiyaga",
            "category": "riz",
            "price_euro": 34,
            "price_cfa": 21000,
            "weight": "25 kg",
            "description": "Riz local de qualité, prix économique",
            "description_bambara": "Malo dugumakɔnɔ, a sɔngɔ man gɛlɛn",
            "image_url": "https://images.unsplash.com/photo-1714070707310-b3737ff0a0fb?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock_quantity": 60,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sucre (Sac)",
            "name_bambara": "Sukaro",
            "category": "sucre",
            "price_euro": 39,
            "price_cfa": 25000,
            "weight": "50 kg",
            "description": "Sucre blanc de qualité supérieure",
            "description_bambara": "Sukaro jɛman ɲuman",
            "image_url": "https://images.pexels.com/photos/4110101/pexels-photo-4110101.jpeg?auto=compress&cs=tinysrgb&w=600",
            "stock_quantity": 25,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mil",
            "name_bambara": "Ɲɔ",
            "category": "cereales",
            "price_euro": 23,
            "price_cfa": 15000,
            "weight": "50 kg",
            "description": "Mil de qualité, céréale traditionnelle",
            "description_bambara": "Ɲɔ ɲuman, dumuni kɔrɔ",
            "image_url": "https://images.pexels.com/photos/7456522/pexels-photo-7456522.jpeg?auto=compress&cs=tinysrgb&w=600",
            "stock_quantity": 40,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixwell Lait 25 kg",
            "name_bambara": "Nɔnɔ Mixwell 25 kg",
            "category": "lait",
            "price_euro": 92,
            "price_cfa": 60000,
            "weight": "25 kg",
            "description": "Lait en poudre Mixwell, grande quantité",
            "description_bambara": "Nɔnɔmugu Mixwell, a caman",
            "image_url": "https://images.pexels.com/photos/11501481/pexels-photo-11501481.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "stock_quantity": 20,
            "is_available": True,
            "is_promotion": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixwell Lait 12 kg",
            "name_bambara": "Nɔnɔ Mixwell 12 kg",
            "category": "lait",
            "price_euro": 46,
            "price_cfa": 30000,
            "weight": "12 kg",
            "description": "Lait en poudre Mixwell, format moyen",
            "description_bambara": "Nɔnɔmugu Mixwell, a cɛmancɛ",
            "image_url": "https://images.pexels.com/photos/11501481/pexels-photo-11501481.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "stock_quantity": 30,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixwell Lait 5 kg",
            "name_bambara": "Nɔnɔ Mixwell 5 kg",
            "category": "lait",
            "price_euro": 22,
            "price_cfa": 14000,
            "weight": "5 kg",
            "description": "Lait en poudre Mixwell, petit format",
            "description_bambara": "Nɔnɔmugu Mixwell, a fitini",
            "image_url": "https://images.pexels.com/photos/11501481/pexels-photo-11501481.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "stock_quantity": 45,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Huile 20 L",
            "name_bambara": "Tulu 20 L",
            "category": "huile",
            "price_euro": 32,
            "price_cfa": 21000,
            "weight": "20 L",
            "description": "Huile de cuisson, grand format",
            "description_bambara": "Tulu tobi ye, a ka bon",
            "image_url": "https://images.unsplash.com/photo-1758958437294-345e16aec47c?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock_quantity": 25,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Huile 5 L",
            "name_bambara": "Tulu 5 L",
            "category": "huile",
            "price_euro": 11,
            "price_cfa": 7000,
            "weight": "5 L",
            "description": "Huile de cuisson, format familial",
            "description_bambara": "Tulu tobi ye, sigidakɔnɔ ta",
            "image_url": "https://images.pexels.com/photos/31321713/pexels-photo-31321713.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "stock_quantity": 55,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pasta Douma",
            "name_bambara": "Makaroni Douma",
            "category": "pates",
            "price_euro": 16,
            "price_cfa": 11000,
            "weight": "5 kg",
            "description": "Pâtes alimentaires de qualité",
            "description_bambara": "Makaroni ɲuman",
            "image_url": "https://images.unsplash.com/photo-1762926627752-37e9b6b42a26?crop=entropy&cs=srgb&fm=jpg&q=85",
            "stock_quantity": 40,
            "is_available": True,
            "is_promotion": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Malo Wousu",
            "name_bambara": "Malo Wusu",
            "category": "cereales",
            "price_euro": 31,
            "price_cfa": 20000,
            "weight": "25 kg",
            "description": "Céréale traditionnelle malienne",
            "description_bambara": "Dumuni kɔrɔ ka bo Mali",
            "image_url": "https://images.pexels.com/photos/7456522/pexels-photo-7456522.jpeg?auto=compress&cs=tinysrgb&w=600",
            "stock_quantity": 30,
            "is_available": True,
            "is_promotion": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    return {"message": "Données de test créées", "count": len(products)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
