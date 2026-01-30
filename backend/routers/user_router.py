from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime
import uuid
from passlib.context import CryptContext
import jwt

import sys
from pathlib import Path
 
try:
    from ..schemas.user import User
    from ..services.firebase_db import get_firestore_client
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.user import User
    from services.firebase_db import get_firestore_client
    
router = APIRouter()

class UserCreateRequest:
    """Request model for creating a new user"""
    def __init__(self, name: str, surname: str, username: str, email: str, profileImageURL: Optional[str] = None):
        self.name = name
        self.surname = surname
        self.username = username
        self.email = email
        self.profileImageURL = profileImageURL

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
 
def get_password_hash(password):
    return pwd_context.hash(password)
 
def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/create", response_model=dict)
async def create_user(user_data: dict):
    """
    Create a new user in Firebase database
    
    Request body:
    {
        "name": "John",
        "surname": "Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "profileImageURL": "https://example.com/image.jpg" (optional)
    }
    """
    try:
        # Validate required fields
        required_fields = ["name", "surname", "username", "email"]
        for field in required_fields:
            if field not in user_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create user instance with generated ID
        user = User(
            userID=user_data.get("userID", str(uuid.uuid4())),
            name=user_data["name"],
            surname=user_data["surname"],
            username=user_data["username"],
            email=user_data["email"],
            profileImageURL=user_data.get("profileImageURL"),
            createdAt=datetime.now(),
            projectIDs=[]
        )
        
        # Save to Firebase
        user_id = user.save_to_firestore()
        
        return {
            "status": "success",
            "userID": user_id,
            "message": f"User {user.username} created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_user(user_id: str):
    """
    Retrieve user information by user ID
    """
    try:
        user_doc = User.get_user_from_firestore(user_id)
    
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "success",
            "user": user_doc.to_firestore_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


 
@router.post("/login")
async def login(user_data: dict):
    """
    Login endpoint to authenticate users.
 
    Request body:
    {
        "username": "johndoe",
        "password": "password123"
    }
    """
    try:
        db = get_firestore_client()
 
        # Retrieve user by username
        users_ref = db.collection("users")
        query = users_ref.where("username", "==", user_data["username"]).stream()
        user_doc = next(query, None)
 
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
 
        user = user_doc.to_dict()
 
        # Verify password
        if not verify_password(user_data["password"], user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
 
        # Create JWT token
        token = create_access_token({"sub": user["username"]})
 
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer"
        }
 
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/{user_id}/addProject", response_model=dict)
async def add_project_to_user(user_id: str, project_name: str):
    """
    Add a new project to the user's project list.
    
    Request body:
    {
        "project_name": "New Project"
    }
    """
    try:
        user = User.get_user_from_firestore(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        project_id = user.add_new_project(project_name, user_id)
        
        if not project_id:
            raise HTTPException(status_code=500, detail="Failed to add project")
        
        return {
            "status": "success",
            "projectID": project_id,
            "message": f"Project '{project_name}' added successfully to user '{user.username}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))