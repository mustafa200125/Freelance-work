from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import socketio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Socket.IO setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ Pydantic Models ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    user_type: str  # "job_seeker" or "employer"
    phone: Optional[str] = None
    profession: Optional[str] = None
    skills: Optional[List[str]] = []
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    profession: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Job(BaseModel):
    job_id: str
    employer_id: str
    employer_name: str
    title: str
    description: str
    job_type: str  # "full_time", "part_time", "remote"
    salary_type: List[str]  # ["daily", "weekly", "monthly"]
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_negotiable: bool = False
    city: str
    area: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    requirements: Optional[str] = None
    status: str = "active"  # "active", "closed", "filled"
    created_at: datetime
    updated_at: datetime

class JobCreate(BaseModel):
    title: str
    description: str
    job_type: str
    salary_type: List[str]
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_negotiable: bool = False
    city: str
    area: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    requirements: Optional[str] = None

class Application(BaseModel):
    application_id: str
    job_id: str
    job_title: str
    job_seeker_id: str
    job_seeker_name: str
    job_seeker_email: str
    employer_id: str
    cover_letter: Optional[str] = None
    status: str = "pending"  # "pending", "accepted", "rejected"
    created_at: datetime

class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None

class Message(BaseModel):
    message_id: str
    sender_id: str
    receiver_id: str
    sender_name: str
    content: str
    read: bool = False
    created_at: datetime

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class Review(BaseModel):
    review_id: str
    reviewer_id: str
    reviewed_id: str
    reviewer_name: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime

class ReviewCreate(BaseModel):
    reviewed_id: str
    rating: int
    comment: Optional[str] = None

class SessionData(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

# ============ Auth Helpers ============

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    """Get current user from session token (cookie or Authorization header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if user_doc:
        return User(**user_doc)
    
    return None

def require_auth(user: Optional[User] = Depends(get_current_user)) -> User:
    """Require authentication"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ============ Auth Endpoints ============

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(require_auth)):
    """Get current user info"""
    return current_user

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for user data and create session"""
    body = await request.json()
    session_id = body.get("session_id")
    user_type = body.get("user_type", "job_seeker")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id for user data
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            resp.raise_for_status()
            user_data = resp.json()
        except Exception as e:
            logger.error(f"Failed to get session data: {e}")
            raise HTTPException(status_code=401, detail="Invalid session_id")
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": user_data["email"]},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
        user = User(**existing_user)
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "user_type": user_type,
            "skills": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
        user = User(**new_user)
    
    # Create session
    session_token = user_data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

# ============ User Endpoints ============

@api_router.put("/users/profile")
async def update_profile(
    profile: UserUpdate,
    current_user: User = Depends(require_auth)
):
    """Update user profile"""
    update_data = profile.dict(exclude_none=True)
    
    if update_data:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    return User(**updated_user)

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user profile by ID"""
    user = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user)

# ============ Job Endpoints ============

@api_router.post("/jobs", response_model=Job)
async def create_job(
    job: JobCreate,
    current_user: User = Depends(require_auth)
):
    """Create a new job (employer only)"""
    if current_user.user_type != "employer":
        raise HTTPException(status_code=403, detail="Only employers can post jobs")
    
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    job_data = {
        "job_id": job_id,
        "employer_id": current_user.user_id,
        "employer_name": current_user.name,
        "status": "active",
        "created_at": now,
        "updated_at": now,
        **job.dict()
    }
    
    await db.jobs.insert_one(job_data)
    
    return Job(**job_data)

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(
    job_type: Optional[str] = None,
    city: Optional[str] = None,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all jobs with filters"""
    query: Dict[str, Any] = {"status": "active"}
    
    if job_type:
        query["job_type"] = job_type
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    if min_salary is not None:
        query["salary_min"] = {"$gte": min_salary}
    
    if max_salary is not None:
        query["salary_max"] = {"$lte": max_salary}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [Job(**job) for job in jobs]

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get job by ID"""
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return Job(**job)

@api_router.get("/jobs/my/posted", response_model=List[Job])
async def get_my_jobs(current_user: User = Depends(require_auth)):
    """Get jobs posted by current employer"""
    if current_user.user_type != "employer":
        raise HTTPException(status_code=403, detail="Only employers can access this")
    
    jobs = await db.jobs.find(
        {"employer_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [Job(**job) for job in jobs]

class StatusUpdate(BaseModel):
    status: str

@api_router.put("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    status_data: StatusUpdate,
    current_user: User = Depends(require_auth)
):
    """Update job status"""
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["employer_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.jobs.update_one(
        {"job_id": job_id},
        {"$set": {"status": status_data.status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Job status updated"}

# ============ Application Endpoints ============

@api_router.post("/applications", response_model=Application)
async def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(require_auth)
):
    """Apply for a job (job seeker only)"""
    if current_user.user_type != "job_seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can apply")
    
    # Check if job exists
    job = await db.jobs.find_one({"job_id": application.job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = await db.applications.find_one({
        "job_id": application.job_id,
        "job_seeker_id": current_user.user_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    application_id = f"app_{uuid.uuid4().hex[:12]}"
    
    app_data = {
        "application_id": application_id,
        "job_id": application.job_id,
        "job_title": job["title"],
        "job_seeker_id": current_user.user_id,
        "job_seeker_name": current_user.name,
        "job_seeker_email": current_user.email,
        "employer_id": job["employer_id"],
        "cover_letter": application.cover_letter,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.applications.insert_one(app_data)
    
    return Application(**app_data)

@api_router.get("/applications/my/submitted", response_model=List[Application])
async def get_my_applications(current_user: User = Depends(require_auth)):
    """Get applications submitted by current job seeker"""
    if current_user.user_type != "job_seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can access this")
    
    apps = await db.applications.find(
        {"job_seeker_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [Application(**app) for app in apps]

@api_router.get("/applications/job/{job_id}", response_model=List[Application])
async def get_job_applications(
    job_id: str,
    current_user: User = Depends(require_auth)
):
    """Get all applications for a specific job (employer only)"""
    # Verify job ownership
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["employer_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    apps = await db.applications.find(
        {"job_id": job_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    return [Application(**app) for app in apps]

@api_router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: str,
    current_user: User = Depends(require_auth)
):
    """Update application status (employer only)"""
    app = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app["employer_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "Application status updated"}

# ============ Message Endpoints ============

@api_router.post("/messages", response_model=Message)
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(require_auth)
):
    """Send a message"""
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    
    msg_data = {
        "message_id": message_id,
        "sender_id": current_user.user_id,
        "receiver_id": message.receiver_id,
        "sender_name": current_user.name,
        "content": message.content,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.messages.insert_one(msg_data)
    
    # Emit socket event
    await sio.emit('new_message', msg_data, room=message.receiver_id)
    
    return Message(**msg_data)

@api_router.get("/messages/conversation/{user_id}", response_model=List[Message])
async def get_conversation(
    user_id: str,
    current_user: User = Depends(require_auth)
):
    """Get conversation between current user and another user"""
    messages = await db.messages.find(
        {
            "$or": [
                {"sender_id": current_user.user_id, "receiver_id": user_id},
                {"sender_id": user_id, "receiver_id": current_user.user_id}
            ]
        },
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    # Mark messages as read
    await db.messages.update_many(
        {"sender_id": user_id, "receiver_id": current_user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return [Message(**msg) for msg in messages]

@api_router.get("/messages/conversations")
async def get_conversations(current_user: User = Depends(require_auth)):
    """Get list of conversations for current user"""
    # Get all messages involving current user
    messages = await db.messages.find(
        {
            "$or": [
                {"sender_id": current_user.user_id},
                {"receiver_id": current_user.user_id}
            ]
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Group by conversation partner
    conversations = {}
    for msg in messages:
        partner_id = msg["receiver_id"] if msg["sender_id"] == current_user.user_id else msg["sender_id"]
        
        if partner_id not in conversations:
            conversations[partner_id] = {
                "user_id": partner_id,
                "last_message": msg["content"],
                "last_message_time": msg["created_at"],
                "unread_count": 0
            }
        
        if msg["receiver_id"] == current_user.user_id and not msg["read"]:
            conversations[partner_id]["unread_count"] += 1
    
    # Get user details for each conversation
    result = []
    for partner_id, conv in conversations.items():
        user = await db.users.find_one({"user_id": partner_id}, {"_id": 0, "name": 1, "picture": 1})
        if user:
            result.append({
                **conv,
                "name": user.get("name", "Unknown"),
                "picture": user.get("picture")
            })
    
    return result

# ============ Review Endpoints ============

@api_router.post("/reviews", response_model=Review)
async def create_review(
    review: ReviewCreate,
    current_user: User = Depends(require_auth)
):
    """Create a review"""
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_id = f"rev_{uuid.uuid4().hex[:12]}"
    
    review_data = {
        "review_id": review_id,
        "reviewer_id": current_user.user_id,
        "reviewed_id": review.reviewed_id,
        "reviewer_name": current_user.name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.reviews.insert_one(review_data)
    
    return Review(**review_data)

@api_router.get("/reviews/user/{user_id}", response_model=List[Review])
async def get_user_reviews(user_id: str):
    """Get all reviews for a user"""
    reviews = await db.reviews.find(
        {"reviewed_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [Review(**rev) for rev in reviews]

@api_router.get("/reviews/stats/{user_id}")
async def get_review_stats(user_id: str):
    """Get review statistics for a user"""
    reviews = await db.reviews.find({"reviewed_id": user_id}, {"_id": 0}).to_list(1000)
    
    if not reviews:
        return {
            "average_rating": 0,
            "total_reviews": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total = len(reviews)
    avg_rating = sum(r["rating"] for r in reviews) / total
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    for r in reviews:
        distribution[r["rating"]] += 1
    
    return {
        "average_rating": round(avg_rating, 2),
        "total_reviews": total,
        "rating_distribution": distribution
    }

# ============ Socket.IO Events ============

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join(sid, data):
    user_id = data.get('user_id')
    if user_id:
        sio.enter_room(sid, user_id)
        logger.info(f"User {user_id} joined room")

# Include the router in the main app
app.include_router(api_router)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
