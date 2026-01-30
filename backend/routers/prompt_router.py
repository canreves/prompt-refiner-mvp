from fastapi import APIRouter, HTTPException
import json


# from schemas.prompt import PromptInput, PromptDBModel
import sys
from pathlib import Path

try:
    from ..schemas.prompt import PromptDBModel, PromptInput
    from ..services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius, test_nebius_api
    
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.prompt import PromptDBModel, PromptInput
    from services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius, test_nebius_api
    
import uuid

router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptInput):
    try:
        # 1. step: FIRST optimize the user's prompt (returns JSON dict)
        optimized_data = optimize_prompt_with_nebius(request.inputPrompt)
        
        # 2. step: THEN analyze the OPTIMIZED prompt 
        # Convert optimized dict to string for analysis
        optimized_text = json.dumps(optimized_data, ensure_ascii=False)
        parsed_result = parse_prompt_with_nebius(optimized_text)
        
        # 3. step: calculate metrics
        initial_tokens = len(request.inputPrompt.split())
        final_tokens = len(optimized_text.split())
        
        # 4. step: return the answers
        return PromptDBModel(
            promptID=str(uuid.uuid4()),
            userID=request.userID,
            projectID="default-project",
            inputPrompt=request.inputPrompt,
            parsedData=parsed_result,  # This is now analysis of OPTIMIZED prompt
            optimizedPrompts=optimized_data,  # Now it's a dict with task, role, style, etc.
            initialTokenSize=initial_tokens,
            finalTokenSizes={"default": final_tokens},
            latencyMs={"default": 0.0} # now 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/savePrompt", response_model=PromptDBModel)
async def save_prompt(prompt: PromptDBModel):
    try:
        prompt_id = prompt.set_to_firestore()
        return prompt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/testNebius", response_model=dict)
async def test_nebius_ai(request : dict):
    """
    Test endpoint for Nebius AI integration.
    Expects a JSON body with 'user_input' and 'ai_model' fields.
    """
    try:
        user_input = request.get("user_input", "")
        ai_model = request.get("ai_model", "openai/gpt-oss-20b")
        
        user_response = test_nebius_api(user_input, ai_model)
        
        return user_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



