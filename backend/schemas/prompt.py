from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# Handle imports for both direct execution and module import
import sys
from pathlib import Path

try:
    from ..services.firebase_db import get_firestore_client
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from services.firebase_db import get_firestore_client


class PromptInput(BaseModel):
    userID: str
    inputPrompt: str
    targetRole : Optional[str] = ""
 
# 1. parsed data
class ParsedPrompt(BaseModel):
    role: Optional[str] = None
    task: Optional[str] = None
    context: Optional[str] = None
    style: Optional[str] = None
    output : Optional[str] = None


# 2. prompt object data to be stored in firestore
class PromptDBModel(BaseModel):
    promptID: str
    userID: str
    projectID: str
    inputPrompt: str

    parsedData: Optional[ParsedPrompt] = None  # role, task, context
    optimizedPrompts: Optional[Dict[str, str]] = None
    usedLLMs: Optional[Dict[str, str]] = None

    # metrics
    initialTokenSize: int = 0
    finalTokenSizes: Dict[str, int] = {}
    latencyMs: Dict[str, float] = {}
    copyCount: int = 0
    overallScores: Optional[Dict[str, float]] = None
    
    # metadata
    createdAt: datetime = Field(default_factory=datetime.now)
    isFavorite: bool = False
    ratings: Optional[Dict[str, int]] = None # [1,5]

    def __init__(self, **data):
        super().__init__(**data)

    def to_firestore_dict(self) -> dict:
        data = {
            "promptID": self.promptID,
            "userID": self.userID,
            "projectID": self.projectID,
            "inputPrompt": self.inputPrompt,
            "parsedData": self.parsedData.model_dump() if self.parsedData else None,
            "optimizedPrompts": self.optimizedPrompts,
            "usedLLMs": self.usedLLMs,
            "initialTokenSize": self.initialTokenSize,
            "finalTokenSizes": self.finalTokenSizes,
            "latencyMs": self.latencyMs,
            "copyCount": self.copyCount,
            "overallScores": self.overallScores,
            "createdAt": self.createdAt,  # Firestore handles datetime objects
            "isFavorite": self.isFavorite,
            "ratings": self.ratings
        }
        return data
    
    def set_to_firestore(self) -> str:
        db = get_firestore_client()
        prompt_ref = db.collection("prompts").document(self.promptID)
        prompt_ref.set(self.to_firestore_dict())
        
        return self.promptID
        
    def delete_from_firestore(self) -> bool:
        try:
            db = get_firestore_client()
            prompt_ref = db.collection("prompts").document(self.promptID)
            prompt_ref.delete()
            return True
        except Exception as e:
            return False
        
    def update_in_firestore(self, update_data: dict) -> bool:
        try:
            db = get_firestore_client()
            prompt_ref = db.collection("prompts").document(self.promptID)
            prompt_ref.update(update_data)
            return True
        except Exception as e:
            return False
    
    @staticmethod
    def get_prompt_from_firestore(prompt_id: str) -> Optional["PromptDBModel"]:
        db = get_firestore_client()
        prompt_ref = db.collection("prompts").document(prompt_id)
        doc = prompt_ref.get()
        if doc.exists:
            data = doc.to_dict()
            # Convert parsedData back to ParsedPrompt model
            if data.get("parsedData"):
                data["parsedData"] = ParsedPrompt(**data["parsedData"])
            return PromptDBModel(**data)
        else:
            return None




    
    