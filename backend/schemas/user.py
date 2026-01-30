
from typing import Optional, Dict, List
from datetime import datetime

# Handle imports for both direct execution and module import
import sys
from pathlib import Path

try:
    from ..services.firebase_db import get_firestore_client
    from ..schemas.prompt import PromptDBModel
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from services.firebase_db import get_firestore_client
    from schemas.prompt import PromptDBModel


class User:
    userID : str = ""
    name : str = ""  
    surname : str = ""
    username : str = ""
    createdAt : datetime = datetime.now()
    last50Prompts : List[PromptDBModel] = []  # list of promptIDs
    email : str = ""
    profileImageURL : Optional[str] = None
    projectIDs : List[Dict[str, str]] = []  # list of {projectID, projectName} dictionaries

    def __init__(self, **data):
        for key, value in data.items():
            setattr(self, key, value)
    

    def to_firestore_dict(self) -> dict:
        data = {
            "userID": self.userID,
            "name": self.name,
            "surname": self.surname,
            "username": self.username,
            "createdAt": self.createdAt,
            "last50Prompts": [prompt.promptID for prompt in self.last50Prompts],
            "email": self.email,
            "profileImageURL": self.profileImageURL,
            "projectIDs": self.projectIDs
        }
        return data
    
    def save_to_firestore(self) -> str:
        try:
            db = get_firestore_client()
            user_ref = db.collection("users").document(self.userID)
            user_ref.set(self.to_firestore_dict())
            
            return self.userID
        except Exception as e:
            return None
    
    def update_in_firestore(self) -> bool:
        try:
            db = get_firestore_client()
            user_ref = db.collection("users").document(self.userID)
            user_ref.update(self.to_firestore_dict())
            return True
        except Exception as e:
            return False

    @staticmethod
    def get_user_from_firestore(user_id: str) -> Optional["User"]:
        db = get_firestore_client()
        user_ref = db.collection("users").document(user_id)
        doc = user_ref.get()
        if doc.exists:
            data = doc.to_dict()
            return User(**data)
        else:
            return None
    
