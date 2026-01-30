from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import json
# Handle imports for both direct execution and module import
import sys
from pathlib import Path

try:
    from ..services.firebase_db import get_firestore_client
    from ..services.nebius_ai import run_nebius_ai
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from services.nebius_ai import run_nebius_ai


class PromptInput(BaseModel):
    userID: str
    inputPrompt: str
    targetRole : Optional[str] = ""
 
# 1. parsed data
class ParsedPrompt(BaseModel):
    role: Optional[str] = None
    role_score: Optional[float] = None
    task: Optional[str] = None
    task_score: Optional[float] = None
    context: Optional[str] = None
    context_score: Optional[float] = None
    style: Optional[str] = None
    style_score: Optional[float] = None
    output : Optional[str] = None
    output_score: Optional[float] = None
    rules: Optional[str] = None
    rules_score: Optional[float] = None

    def __init__(self, **data):
        super().__init__(**data)
    
    def to_dict(self) -> dict:
        return {
            "role": self.role,
            "role_score": self.role_score,
            "task": self.task,
            "task_score": self.task_score,
            "context": self.context,
            "context_score": self.context_score,
            "style": self.style,
            "style_score": self.style_score,
            "output": self.output,
            "output_score": self.output_score,
            "rules": self.rules,
            "rules_score": self.rules_score
        }


# 2. prompt object data to be stored in firestore
class PromptDBModel(BaseModel):
    promptID: str
    userID: str
    projectID: str
    inputPrompt: str

    parsedData: Optional[ParsedPrompt] = None  # role, task, context
    optimizedPrompts: Optional[Dict[str, str]] = {}
    usedLLMs: Optional[Dict[str, str]] = {}

    # metrics
    initialTokenSize: int = 0
    finalTokenSizes: Dict[str, int] = {}
    latencyMs: Dict[str, float] = {}
    copyCount: int = 0
    overallScores: Optional[Dict[str, float]] = None
    
    # metadata
    createdAt: datetime = Field(default_factory=datetime.now)
    isFavorite: bool = False
    ratings: Optional[Dict[str, int]] = {} # [1,5]

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
        
    def get_parsed_data_and_scores_from_llm_returns_score(self, weights : dict[str, float] = {
        "task" : 2,
        "role" : 2,
        "style" : 2,
        "output" : 2,
        "rules" : 2,
    }, ai_model: str = "openai/gpt-oss-20b") -> Optional[Dict[str, Any]]:
        system_prompt = """
        You are an expert Prompt Engineer. Analyze the provided prompt and parse it into six components: Task, Role, Style, Output, Rules, and Context.

        ### Instructions
        1. **Extraction:** Extract the *verbatim* text for each component. Do not summarize or alter the text.
        2. **Scoring:** Rate each component from 0-10 based on the "Scoring Rubric" below.
        3. **Missing Data:** If a component is not found, set its text aspect to "" (empty string) and its score to 0.

        ### Scoring Rubric
        * **0:** Component is completely missing.
        * **1-4:** Vague or implied (e.g., "write something").
        * **5-7:** Clear but generic (e.g., "write a blog post").
        * **8-10:** Highly specific, detailed, and constraint-driven.

        ### Output Format
        Return valid JSON only. Adhere strictly to this schema:
        {
        "task": "extracted text", "task_score": int,
        "role": "extracted text", "role_score": int,
        "style": "extracted text", "style_score": int,
        "output": "extracted text", "output_score": int,
        "rules": "extracted text", "rules_score": int,
        "context": "extracted text", "context_score": int
        }
        """
        response = run_nebius_ai(prompt=self.inputPrompt, system_prompt=system_prompt, ai_model=ai_model)
        
        # Get parsed data and scores
        content = response["choices"][0]["message"]["content"]
        if isinstance(content, str):
            content = json.loads(content)
        self.parsedData = ParsedPrompt(**content)
        self.initialTokenSize = response.get("usage").get("completion_tokens", 0) 
        
        # Calculate overall score
        total_weight = sum(weights.values())
        self.overallScores = (self.parsedData.task_score * weights.get("task", 0) / total_weight) + \
                             (self.parsedData.role_score * weights.get("role", 0) / total_weight) + \
                             (self.parsedData.style_score * weights.get("style", 0) / total_weight) + \
                             (self.parsedData.output_score * weights.get("output", 0) / total_weight) + \
                             (self.parsedData.rules_score * weights.get("rules", 0) / total_weight) + \
                             (self.parsedData.context_score * weights.get("context", 0) / total_weight)

        return {
            "parsedData": self.parsedData.to_dict() if self.parsedData else None,
            "overallScores": self.overallScores,
            "completionTokens" : self.initialTokenSize,
            "promptTokens" : response.get("usage").get("prompt_tokens", 0),
        }
    
    def optimize_new_prompt_with_llm(self, ai_model: str = "openai/gpt-oss-20b", weights: dict[str, float] = {
        "task" : 2,
        "role" : 2,
        "style" : 2,
        "output" : 2,
        "rules" : 2,
    }) -> dict[str, Any]:
        system_prompt = f"""
        You are a world-class Prompt Engineering expert. Using the parsed components of the user's prompt, rewrite it into a highly optimized, professional prompt that will yield the best results from an AI model.

        ### Instructions
        1. **Incorporate Components:** Seamlessly integrate the Task, Role, Style, Output, Rules, and Context into a coherent prompt.
        2. **Enhance Clarity:** Use precise language and structure to ensure the prompt is clear and unambiguous.
        3. **Maximize Effectiveness:** Tailor the prompt to leverage the strengths of AI models, focusing on specificity and detail.
        4. **Weighted Approach:** Prioritize components based on the following weights when crafting the prompt:
        {weights}

        ### Output
        Provide only the optimized prompt text without any additional commentary or formatting.
        """
        response = run_nebius_ai(prompt=self.inputPrompt, system_prompt=system_prompt, ai_model=ai_model)
        
        optimized_prompt = response["choices"][0]["message"]["content"]
        new_optimized_id = str(uuid.uuid4())
        self.optimizedPrompts[new_optimized_id] = optimized_prompt
        self.finalTokenSizes[new_optimized_id] = response.get("usage").get("completion_tokens", 0)
        self.usedLLMs[new_optimized_id] = ai_model
        
        return {
            "optimizedPromptID": new_optimized_id,
            "optimizedPrompt": optimized_prompt,
            "finalTokenSize": self.finalTokenSizes[new_optimized_id],
            "usedLLM": ai_model
        }

    def save_rating_to_firestore(self, rating: float, optimizedPromptID : str) -> bool:
        try:
            self.ratings[optimizedPromptID] = rating

            db = get_firestore_client()
            prompt_ref = db.collection("prompts").document(self.promptID)
            prompt_ref.update(
                {
                    "ratings" : self.ratings
                }
            )
            
            return True
        except:
            return False

    def save_latency_to_firestore(self, latency, optimizedPromptID : str) -> bool:
        try:
            self.latencyMs[optimizedPromptID] = latency

            db = get_firestore_client()
            prompt_ref = db.collection("prompts").document(self.promptID)
            prompt_ref.update(
                {
                    "latencyMs" : self.latencyMs
                }
            )
            
            return True
        except:
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




    
    