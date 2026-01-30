from fastapi import APIRouter, HTTPException, Depends
from ..core.deps import get_current_user
from typing import Optional
from datetime import datetime
import uuid

import sys
from pathlib import Path

try:
    from ..schemas.user import User
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.user import User
    

router = APIRouter()

class UserCreateRequest:
    """Request model for creating a new user"""
    def __init__(self, name: str, surname: str, username: str, email: str, profileImageURL: Optional[str] = None):
        self.name = name
        self.surname = surname
        self.username = username
        self.email = email
        self.profileImageURL = profileImageURL

@router.post("/create", response_model=dict)
async def create_user(user_data: dict, current_user: dict = Depends(get_current_user)):
    """
    Create a new user in Firebase database.
    Requires Authorization bearer token.
    
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
        
        # Use the UID from the authenticated token
        user_id = current_user['uid']
        
        # Create user instance with Firebase Auth UID
        user = User(
            userID=user_id,
            name=user_data["name"],
            surname=user_data["surname"],
            username=user_data["username"],
            email=user_data["email"],
            profileImageURL=user_data.get("profileImageURL"),
            createdAt=datetime.now(),
            last50Prompts=[],
            projectIDs=[]
        )
        
        # Save to Firebase
        user.save_to_firestore()
        
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