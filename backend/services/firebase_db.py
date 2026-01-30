import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv

load_dotenv()

# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:
        # we will get serviceAccountKey.json path here.
        import os
        from pathlib import Path
       
        # Ideally, use an absolute path or relative to this file
        current_dir = Path(__file__).resolve().parent
        key_path = current_dir / "serviceAccountKey.json"
        
        if not key_path.exists():
            print(f"Warning: serviceAccountKey.json not found at {key_path}")
            # fall back to relative path if needed, though this is cleaner
            cred = credentials.Certificate("backend/services/serviceAccountKey.json")
        else:
            cred = credentials.Certificate(str(key_path))
            
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    initialize_firebase()
    return firestore.client()
