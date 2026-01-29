import firebase_admin
from firebase_admin import credentials, firestore

import os
from dotenv import load_dotenv

load_dotenv()




# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:
        # we will get serviceAccountKey.json path here.
        cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"))
        firebase_admin.initialize_app(cred)

def get_firestore_client():
    initialize_firebase()
    return firestore.client()

def upload_prompt_to_firestore(data: dict):
    db = get_firestore_client()
    db.collection("prompts").add(data)

# def save_prompt_to_firestore(data: dict):
#     db = firestore.client()
#     # add to the 'prompts'
#     db.collection("prompts").add(data)