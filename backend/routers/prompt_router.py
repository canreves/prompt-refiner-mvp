from fastapi import APIRouter, HTTPException


# from schemas.prompt import PromptInput, PromptDBModel
import sys
from pathlib import Path

try:
    from ..schemas.prompt import PromptDBModel, PromptInput
    from ..services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius
    from ..services.firebase_db import save_prompt_to_firestore
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.prompt import PromptDBModel, PromptInput
    from services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius
    from services.firebase_db import save_prompt_to_firestore
    
import uuid

router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptInput):
    try:
        # 1. step: analyze prompt (parsing)
        parsed_result = parse_prompt_with_nebius(request.inputPrompt)
        
        # 2. step: optimize it
        optimized_text = optimize_prompt_with_nebius(parsed_result, request.inputPrompt)
        
        # 3. step: calculate metrics
        initial_tokens = len(request.inputPrompt.split())
        final_tokens = len(optimized_text.split())
        
        # 4. step: return the answers
        return PromptDBModel(
            promptID=str(uuid.uuid4()),
            userID=request.userID,
            projectID="default-project",
            inputPrompt=request.inputPrompt,
            parsedData=parsed_result,
            optimizedPrompts={"default": optimized_text},
            initialTokenSize=initial_tokens,
            finalTokenSizes={"default": final_tokens},
            latencyMs={"default": 0.0} # now 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/savePrompt", response_model=PromptDBModel)
async def save_prompt(prompt: PromptDBModel):
    try:
        prompt_id = save_prompt_to_firestore(prompt)
        return prompt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
