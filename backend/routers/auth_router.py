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

class EmailPasswordSignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None

class EmailPasswordLoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class UserResponse(BaseModel):
    uid: str
    email: str
    name: str | None = None
    picture: str | None = None
    is_new_user: bool = False
    custom_token: str | None = None  # For email/password auth

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


@router.post("/signup", response_model=UserResponse)
async def signup_with_email(request: EmailPasswordSignupRequest):
    """
    Create a new user with email and password.
    Returns user info and custom token for frontend authentication.
    """
    try:
        initialize_firebase()
        
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.name
        )
        
        uid = user_record.uid
        
        # Create user in Firestore
        db = get_firestore_client()
        user_data = {
            'uid': uid,
            'email': request.email,
            'name': request.name or '',
            'profileImageURL': None,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        user_ref = db.collection('users').document(uid)
        user_ref.set(user_data)
        
        # Generate custom token for frontend to use
        custom_token = auth.create_custom_token(uid)
        
        return UserResponse(
            uid=uid,
            email=request.email,
            name=request.name,
            picture=None,
            is_new_user=True,
            custom_token=custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
        )
        
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already exists")
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=UserResponse)
async def login_with_email(request: EmailPasswordLoginRequest):
    """
    Login with email and password.
    Note: Password verification happens on the frontend with Firebase Client SDK.
    This endpoint verifies the user exists and returns user info.
    """
    try:
        initialize_firebase()
        
        # Get user by email
        user_record = auth.get_user_by_email(request.email)
        uid = user_record.uid
        
        # Get user from Firestore
        db = get_firestore_client()
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # Create user in Firestore if doesn't exist
            user_data = {
                'uid': uid,
                'email': user_record.email,
                'name': user_record.display_name or '',
                'profileImageURL': user_record.photo_url,
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            }
            user_ref.set(user_data)
        else:
            # Update last login
            user_ref.update({
                'updatedAt': datetime.utcnow().isoformat()
            })
            user_data = user_doc.to_dict()
        
        # Generate custom token
        custom_token = auth.create_custom_token(uid)
        
        return UserResponse(
            uid=uid,
            email=user_record.email,
            name=user_data.get('name') or user_record.display_name,
            picture=user_data.get('profileImageURL') or user_record.photo_url,
            is_new_user=False,
            custom_token=custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
        )
        
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Error logging in: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-password")
async def reset_password(request: PasswordResetRequest):
    """
    Send password reset email.
    Note: The actual email sending is handled by Firebase.
    This endpoint generates a password reset link.
    """
    try:
        initialize_firebase()
        
        # Verify user exists
        try:
            auth.get_user_by_email(request.email)
        except auth.UserNotFoundError:
            # Don't reveal if email exists for security
            return {"status": "success", "message": "If the email exists, a reset link will be sent"}
        
        # Generate password reset link (requires Firebase Admin SDK configuration)
        # Note: For production, you need to configure email templates in Firebase Console
        link = auth.generate_password_reset_link(request.email)
        
        return {
            "status": "success",
            "message": "Password reset link generated",
            "link": link  # In production, this should be sent via email, not returned
        }
        
    except Exception as e:
        print(f"Error resetting password: {e}")
        # Don't reveal if error occurred for security
        return {"status": "success", "message": "If the email exists, a reset link will be sent"}
