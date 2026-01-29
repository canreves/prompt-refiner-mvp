from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

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

    
    