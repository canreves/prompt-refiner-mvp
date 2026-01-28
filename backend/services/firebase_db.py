import firebase_admin
from firebase_admin import credentials, firestore

# starting firebase (singleton pattern)
def initialize_firebase():
    if not firebase_admin._apps:
        # we will get serviceAccountKey.json path here.
        cred = credentials.ApplicationDefault() 
        firebase_admin.initialize_app(cred)

def save_prompt_to_firestore(data: dict):
    db = firestore.client()
    # add to the 'prompts'
    db.collection("prompts").add(data)