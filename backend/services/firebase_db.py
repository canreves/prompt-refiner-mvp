import firebase_admin
from firebase_admin import credentials, firestore

import os
import json
from dotenv import load_dotenv

load_dotenv()

# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:


        
            #
        local_path = "backend/services/serviceAccountKey.json"
        cred = credentials.Certificate(local_path)
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    initialize_firebase()
    return firestore.client()
