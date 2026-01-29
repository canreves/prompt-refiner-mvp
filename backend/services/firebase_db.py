import firebase_admin
from firebase_admin import credentials, firestore

import sys
from pathlib import Path

# Handle imports for both direct execution and module import
try:
    from ..schemas.user import User
    from ..schemas.prompt import PromptDBModel
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.user import User
    from schemas.prompt import PromptDBModel




# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:
        # we will get serviceAccountKey.json path here.
        cred = credentials.Certificate("backend/services/serviceAccountKey.json")
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    initialize_firebase()
    return firestore.client()

def save_prompt_to_firestore(prompt : PromptDBModel) -> str:
    db = get_firestore_client()
    doc_ref = db.collection("prompts").add(prompt.to_firestore_dict())
    return doc_ref[1].id  # Return the document ID

def save_user_to_firestore(user: User) -> str:
    db = get_firestore_client()
    user_ref = db.collection("users").document(user.userID)
    user_ref.set(user.to_firestore_dict())
    
    return user.userID