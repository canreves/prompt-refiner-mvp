from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import auth
from datetime import datetime
import sys
from pathlib import Path

try:
    from services.firebase_db import initialize_firebase, get_firestore_client
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from services.firebase_db import initialize_firebase, get_firestore_client

router = APIRouter()

class TokenVerifyRequest(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    uid: str
    email: str
    name: str | None = None
    picture: str | None = None
    is_new_user: bool = False

@router.post("/verify-token", response_model=UserResponse)
async def verify_firebase_token(request: TokenVerifyRequest):
    """
    Verify Firebase ID token from frontend and return user info.
    Creates user in Firestore if they don't exist.
    """
    try:
        # Initialize Firebase Admin if not already done
        initialize_firebase()
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(request.id_token)
        
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '')
        picture = decoded_token.get('picture', '')
        
        # Check if user exists in Firestore, create if not
        db = get_firestore_client()
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        is_new_user = False
        if not user_doc.exists:
            # Create new user in Firestore
            is_new_user = True
            user_data = {
                'uid': uid,
                'email': email,
                'name': name,
                'profileImageURL': picture,
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            }
            user_ref.set(user_data)
        else:
            # Update last login
            user_ref.update({
                'updatedAt': datetime.utcnow().isoformat()
            })
        
        return UserResponse(
            uid=uid,
            email=email,
            name=name,
            picture=picture,
            is_new_user=is_new_user
        )
        
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="ID token has expired")
    except Exception as e:
        print(f"Error verifying token: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{uid}")
async def get_user(uid: str):
    """Get user info from Firestore by UID"""
    try:
        initialize_firebase()
        db = get_firestore_client()
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user_doc.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))
