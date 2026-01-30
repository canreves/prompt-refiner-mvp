import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv

load_dotenv()

# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:
        # we will get serviceAccountKey.json path here.
        cred = credentials.Certificate("backend/services/serviceAccountKey.json")
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    initialize_firebase()
    return firestore.client()
