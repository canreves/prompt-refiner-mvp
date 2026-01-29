import firebase_admin
from firebase_admin import credentials, firestore

import json
import os
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
        # Prefer Render env var for service account JSON
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        else:
            # Fallback to local file path for dev
            local_path = service_account_path or "backend/services/serviceAccountKey.json"
            cred = credentials.Certificate(local_path)
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