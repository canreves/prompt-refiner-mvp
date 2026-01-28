from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# 1. user input from frontend
class PromptInput(BaseModel):
    user_id: str
    input_prompt: str
    target_role: Optional[str] = "General Assistant"

# 2. parsed data
class ParsedPrompt(BaseModel):
    role: Optional[str] = None
    task: Optional[str] = None
    context: Optional[str] = None

# 3. prompt object data to be stored in firestore
class PromptDBModel(BaseModel):
    prompt_id: str
    user_id: str
    input_prompt: str
    parsed_data: ParsedPrompt  # role, task, context
    optimized_prompt: Optional[str] = None
    
    # metrics
    initial_token_size: int = 0
    final_token_size: int = 0
    latency_ms: float = 0.0
    
    # metadata
    created_at: datetime = Field(default_factory=datetime.now)
    is_favorite: bool = False
    rating: Optional[int] = None # [1,5]
    
    class Config:
        from_attributes = True