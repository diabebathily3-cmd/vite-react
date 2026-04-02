from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'maliride_secret_key_2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI(title="MaliRide API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ====================== MODELS ======================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    
class UserCreate(UserBase):
    password: str
    role: Literal["passenger", "driver", "admin"] = "passenger"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    phone: str
    role: str
    picture: Optional[str] = None
    created_at: datetime
    is_active: bool = True
    # Driver specific
    vehicle_info: Optional[dict] = None
    is_online: bool = False
    current_location: Optional[dict] = None
    rating: float = 5.0
    total_rides: int = 0
    earnings: float = 0

class RideRequest(BaseModel):
    pickup_location: dict  # {lat, lng, address}
    dropoff_location: dict  # {lat, lng, address}
    payment_method: Literal["cash", "mobile_money"] = "cash"

class Ride(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ride_id: str
    passenger_id: str
    driver_id: Optional[str] = None
    pickup_location: dict
    dropoff_location: dict
    status: Literal["pending", "accepted", "arrived", "in_progress", "completed", "cancelled"]
    payment_method: str
    estimated_price: float
    final_price: Optional[float] = None
    distance_km: float
    duration_minutes: int
    created_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str
    ride_id: str
    sender_id: str
    content: str
    created_at: datetime

class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rating_id: str
    ride_id: str
    rater_id: str
    rated_id: str
    score: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime

# ====================== HELPERS ======================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    # Check cookies first
    token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    # Check if it's a Google OAuth session
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expirée")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        return user
    
    # Try JWT token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

def calculate_price(distance_km: float) -> float:
    """Calculate ride price based on distance - Mali pricing"""
    base_fare = 500  # 500 FCFA base
    per_km = 300  # 300 FCFA per km
    return round(base_fare + (distance_km * per_km), 0)

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return round(R * c, 2)

# ====================== AUTH ROUTES ======================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "is_online": False,
        "vehicle_info": None,
        "current_location": None,
        "rating": 5.0,
        "total_rides": 0,
        "earnings": 0
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.role)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    user_doc.pop("password")
    user_doc.pop("_id", None)
    return {"user": user_doc, "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    """Login with email and password"""
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user["user_id"], user["role"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRATION_HOURS * 3600,
        path="/"
    )
    
    user.pop("password", None)
    user.pop("_id", None)
    return {"user": user, "token": token}

@api_router.post("/auth/session")
async def process_google_session(request: Request, response: Response):
    """Process Google OAuth session from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requis")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session_data = auth_response.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": session_data["name"],
                "picture": session_data.get("picture")
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": session_data["email"],
            "name": session_data["name"],
            "phone": "",
            "password": "",
            "role": "passenger",
            "picture": session_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "is_online": False,
            "vehicle_info": None,
            "current_location": None,
            "rating": 5.0,
            "total_rides": 0,
            "earnings": 0
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_token = session_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 3600,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    return {"user": user, "token": session_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user info"""
    user.pop("password", None)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Déconnexion réussie"}

# ====================== USER ROUTES ======================

@api_router.get("/users/drivers")
async def get_available_drivers():
    """Get all online drivers"""
    drivers = await db.users.find(
        {"role": "driver", "is_online": True, "is_active": True},
        {"_id": 0, "password": 0}
    ).to_list(100)
    return drivers

@api_router.put("/users/location")
async def update_location(location: dict, user: dict = Depends(get_current_user)):
    """Update user's current location"""
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"current_location": location}}
    )
    return {"message": "Location mise à jour"}

@api_router.put("/users/status")
async def toggle_online_status(user: dict = Depends(get_current_user)):
    """Toggle driver online/offline status"""
    if user["role"] != "driver":
        raise HTTPException(status_code=403, detail="Réservé aux chauffeurs")
    
    new_status = not user.get("is_online", False)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"is_online": new_status}}
    )
    return {"is_online": new_status}

@api_router.put("/users/vehicle")
async def update_vehicle_info(vehicle_info: dict, user: dict = Depends(get_current_user)):
    """Update driver's vehicle info"""
    if user["role"] != "driver":
        raise HTTPException(status_code=403, detail="Réservé aux chauffeurs")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"vehicle_info": vehicle_info}}
    )
    return {"message": "Informations véhicule mises à jour"}

@api_router.put("/users/profile")
async def update_profile(profile_data: dict, user: dict = Depends(get_current_user)):
    """Update user profile - different fields for drivers vs passengers"""
    update_fields = {}
    
    # Common fields
    if "name" in profile_data:
        update_fields["name"] = profile_data["name"]
    if "phone" in profile_data:
        update_fields["phone"] = profile_data["phone"]
    
    # Driver-specific fields
    if user["role"] == "driver":
        if "documents" in profile_data:
            update_fields["documents"] = profile_data["documents"]
        if "bio" in profile_data:
            update_fields["bio"] = profile_data["bio"]
    
    if update_fields:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_fields}
        )
    
    # Return updated user
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password": 0})
    return updated_user

@api_router.get("/users/profile/{user_id}")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get a user's public profile - shows different info for drivers"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # For drivers, return full profile
    if user["role"] == "driver":
        return {
            "user_id": user["user_id"],
            "name": user["name"],
            "picture": user.get("picture"),
            "role": user["role"],
            "rating": user.get("rating", 5.0),
            "total_rides": user.get("total_rides", 0),
            "vehicle_info": user.get("vehicle_info"),
            "member_since": user.get("created_at"),
            "is_verified": bool(user.get("documents", {}).get("license"))
        }
    
    # For passengers, return basic profile
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "picture": user.get("picture"),
        "role": user["role"],
        "rating": user.get("rating", 5.0),
        "total_rides": user.get("total_rides", 0)
    }

# ====================== RIDE ROUTES ======================

@api_router.post("/rides/estimate")
async def estimate_ride(ride_request: RideRequest):
    """Estimate ride price"""
    distance = calculate_distance(
        ride_request.pickup_location["lat"],
        ride_request.pickup_location["lng"],
        ride_request.dropoff_location["lat"],
        ride_request.dropoff_location["lng"]
    )
    
    # Estimate duration (assuming average speed of 30 km/h in city)
    duration = round((distance / 30) * 60, 0)
    
    price = calculate_price(distance)
    
    return {
        "distance_km": distance,
        "duration_minutes": int(duration),
        "estimated_price": price,
        "currency": "FCFA"
    }

@api_router.post("/rides")
async def create_ride(ride_request: RideRequest, user: dict = Depends(get_current_user)):
    """Create a new ride request"""
    if user["role"] != "passenger":
        raise HTTPException(status_code=403, detail="Réservé aux passagers")
    
    # Check for active rides
    active_ride = await db.rides.find_one({
        "passenger_id": user["user_id"],
        "status": {"$in": ["pending", "accepted", "arrived", "in_progress"]}
    }, {"_id": 0})
    
    if active_ride:
        raise HTTPException(status_code=400, detail="Vous avez déjà une course en cours")
    
    distance = calculate_distance(
        ride_request.pickup_location["lat"],
        ride_request.pickup_location["lng"],
        ride_request.dropoff_location["lat"],
        ride_request.dropoff_location["lng"]
    )
    
    duration = round((distance / 30) * 60, 0)
    price = calculate_price(distance)
    
    ride_id = f"ride_{uuid.uuid4().hex[:12]}"
    ride_doc = {
        "ride_id": ride_id,
        "passenger_id": user["user_id"],
        "driver_id": None,
        "pickup_location": ride_request.pickup_location,
        "dropoff_location": ride_request.dropoff_location,
        "status": "pending",
        "payment_method": ride_request.payment_method,
        "estimated_price": price,
        "final_price": None,
        "distance_km": distance,
        "duration_minutes": int(duration),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "accepted_at": None,
        "completed_at": None
    }
    
    await db.rides.insert_one(ride_doc)
    ride_doc.pop("_id", None)
    
    return ride_doc

@api_router.get("/rides/active")
async def get_active_ride(user: dict = Depends(get_current_user)):
    """Get user's active ride"""
    query = {"status": {"$in": ["pending", "accepted", "arrived", "in_progress"]}}
    
    if user["role"] == "passenger":
        query["passenger_id"] = user["user_id"]
    elif user["role"] == "driver":
        query["driver_id"] = user["user_id"]
    
    ride = await db.rides.find_one(query, {"_id": 0})
    
    if ride:
        # Get other party info
        if user["role"] == "passenger" and ride.get("driver_id"):
            driver = await db.users.find_one({"user_id": ride["driver_id"]}, {"_id": 0, "password": 0})
            ride["driver"] = driver
        elif user["role"] == "driver":
            passenger = await db.users.find_one({"user_id": ride["passenger_id"]}, {"_id": 0, "password": 0})
            ride["passenger"] = passenger
    
    return ride

@api_router.get("/rides/pending")
async def get_pending_rides(user: dict = Depends(get_current_user)):
    """Get pending rides for drivers"""
    if user["role"] != "driver":
        raise HTTPException(status_code=403, detail="Réservé aux chauffeurs")
    
    rides = await db.rides.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(20)
    
    # Add passenger info
    for ride in rides:
        passenger = await db.users.find_one({"user_id": ride["passenger_id"]}, {"_id": 0, "password": 0})
        ride["passenger"] = passenger
    
    return rides

@api_router.put("/rides/{ride_id}/accept")
async def accept_ride(ride_id: str, user: dict = Depends(get_current_user)):
    """Driver accepts a ride"""
    if user["role"] != "driver":
        raise HTTPException(status_code=403, detail="Réservé aux chauffeurs")
    
    # Check if driver has active ride
    active = await db.rides.find_one({
        "driver_id": user["user_id"],
        "status": {"$in": ["accepted", "arrived", "in_progress"]}
    })
    
    if active:
        raise HTTPException(status_code=400, detail="Vous avez déjà une course en cours")
    
    result = await db.rides.update_one(
        {"ride_id": ride_id, "status": "pending"},
        {"$set": {
            "driver_id": user["user_id"],
            "status": "accepted",
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Course non disponible")
    
    ride = await db.rides.find_one({"ride_id": ride_id}, {"_id": 0})
    return ride

@api_router.put("/rides/{ride_id}/status")
async def update_ride_status(ride_id: str, status: dict, user: dict = Depends(get_current_user)):
    """Update ride status"""
    new_status = status.get("status")
    valid_statuses = ["arrived", "in_progress", "completed", "cancelled"]
    
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    ride = await db.rides.find_one({"ride_id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    # Verify user is part of this ride
    if user["user_id"] not in [ride.get("passenger_id"), ride.get("driver_id")]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    update_data = {"status": new_status}
    
    if new_status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        update_data["final_price"] = ride["estimated_price"]
        
        # Update driver earnings
        if ride.get("driver_id"):
            await db.users.update_one(
                {"user_id": ride["driver_id"]},
                {
                    "$inc": {
                        "earnings": ride["estimated_price"],
                        "total_rides": 1
                    }
                }
            )
        
        # Update passenger ride count
        await db.users.update_one(
            {"user_id": ride["passenger_id"]},
            {"$inc": {"total_rides": 1}}
        )
    
    await db.rides.update_one({"ride_id": ride_id}, {"$set": update_data})
    
    updated_ride = await db.rides.find_one({"ride_id": ride_id}, {"_id": 0})
    return updated_ride

@api_router.get("/rides/history")
async def get_ride_history(user: dict = Depends(get_current_user)):
    """Get user's ride history"""
    query = {}
    if user["role"] == "passenger":
        query["passenger_id"] = user["user_id"]
    elif user["role"] == "driver":
        query["driver_id"] = user["user_id"]
    
    rides = await db.rides.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    # Add other party info
    for ride in rides:
        if user["role"] == "passenger" and ride.get("driver_id"):
            driver = await db.users.find_one({"user_id": ride["driver_id"]}, {"_id": 0, "password": 0})
            ride["driver"] = driver
        elif user["role"] == "driver":
            passenger = await db.users.find_one({"user_id": ride["passenger_id"]}, {"_id": 0, "password": 0})
            ride["passenger"] = passenger
    
    return rides

# ====================== CHAT ROUTES ======================

@api_router.post("/chat/{ride_id}")
async def send_message(ride_id: str, message: dict, user: dict = Depends(get_current_user)):
    """Send a message in ride chat"""
    ride = await db.rides.find_one({"ride_id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    if user["user_id"] not in [ride.get("passenger_id"), ride.get("driver_id")]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "ride_id": ride_id,
        "sender_id": user["user_id"],
        "content": message.get("content", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    message_doc.pop("_id", None)
    
    return message_doc

@api_router.get("/chat/{ride_id}")
async def get_messages(ride_id: str, user: dict = Depends(get_current_user)):
    """Get messages for a ride"""
    ride = await db.rides.find_one({"ride_id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    if user["user_id"] not in [ride.get("passenger_id"), ride.get("driver_id")]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    messages = await db.messages.find({"ride_id": ride_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    return messages

# ====================== RATING ROUTES ======================

@api_router.post("/ratings")
async def create_rating(rating_data: dict, user: dict = Depends(get_current_user)):
    """Rate a completed ride"""
    ride = await db.rides.find_one({"ride_id": rating_data.get("ride_id")}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    if ride["status"] != "completed":
        raise HTTPException(status_code=400, detail="La course doit être terminée")
    
    if user["user_id"] not in [ride.get("passenger_id"), ride.get("driver_id")]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    # Determine who is being rated
    if user["user_id"] == ride["passenger_id"]:
        rated_id = ride["driver_id"]
    else:
        rated_id = ride["passenger_id"]
    
    if not rated_id:
        raise HTTPException(status_code=400, detail="Personne à noter non trouvée")
    
    # Check if already rated
    existing = await db.ratings.find_one({
        "ride_id": rating_data["ride_id"],
        "rater_id": user["user_id"]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà noté cette course")
    
    rating_id = f"rating_{uuid.uuid4().hex[:12]}"
    rating_doc = {
        "rating_id": rating_id,
        "ride_id": rating_data["ride_id"],
        "rater_id": user["user_id"],
        "rated_id": rated_id,
        "score": min(5, max(1, rating_data.get("score", 5))),
        "comment": rating_data.get("comment"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ratings.insert_one(rating_doc)
    
    # Update rated user's average rating
    ratings = await db.ratings.find({"rated_id": rated_id}, {"_id": 0}).to_list(1000)
    if ratings:
        avg_rating = sum(r["score"] for r in ratings) / len(ratings)
        await db.users.update_one(
            {"user_id": rated_id},
            {"$set": {"rating": round(avg_rating, 2)}}
        )
    
    rating_doc.pop("_id", None)
    return rating_doc

# ====================== ADMIN ROUTES ======================

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_current_user)):
    """Get admin dashboard stats"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    
    total_users = await db.users.count_documents({})
    total_passengers = await db.users.count_documents({"role": "passenger"})
    total_drivers = await db.users.count_documents({"role": "driver"})
    online_drivers = await db.users.count_documents({"role": "driver", "is_online": True})
    
    total_rides = await db.rides.count_documents({})
    completed_rides = await db.rides.count_documents({"status": "completed"})
    active_rides = await db.rides.count_documents({"status": {"$in": ["pending", "accepted", "arrived", "in_progress"]}})
    
    # Calculate revenue
    completed = await db.rides.find({"status": "completed"}, {"_id": 0, "final_price": 1}).to_list(10000)
    total_revenue = sum(r.get("final_price", 0) or 0 for r in completed)
    
    return {
        "total_users": total_users,
        "total_passengers": total_passengers,
        "total_drivers": total_drivers,
        "online_drivers": online_drivers,
        "total_rides": total_rides,
        "completed_rides": completed_rides,
        "active_rides": active_rides,
        "total_revenue": total_revenue
    }

@api_router.get("/admin/users")
async def get_all_users(user: dict = Depends(get_current_user)):
    """Get all users (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/admin/rides")
async def get_all_rides(user: dict = Depends(get_current_user)):
    """Get all rides (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    
    rides = await db.rides.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for ride in rides:
        passenger = await db.users.find_one({"user_id": ride["passenger_id"]}, {"_id": 0, "password": 0})
        ride["passenger"] = passenger
        if ride.get("driver_id"):
            driver = await db.users.find_one({"user_id": ride["driver_id"]}, {"_id": 0, "password": 0})
            ride["driver"] = driver
    
    return rides

@api_router.put("/admin/users/{user_id}/status")
async def toggle_user_status(user_id: str, user: dict = Depends(get_current_user)):
    """Toggle user active status (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    
    target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    new_status = not target_user.get("is_active", True)
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {"user_id": user_id, "is_active": new_status}

# ====================== HEALTH CHECK ======================

@api_router.get("/")
async def root():
    return {"message": "MaliRide API - Bienvenue!"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MaliRide API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
