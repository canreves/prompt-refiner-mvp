from fastapi import APIRouter, HTTPException
import time

# from schemas.prompt import PromptInput, PromptDBModel
import sys
from pathlib import Path

try:
    from ..schemas.prompt import PromptDBModel, PromptInput
    from ..services.nebius_ai import test_nebius_api
    
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.prompt import PromptDBModel, PromptInput
    from services.nebius_ai import test_nebius_api


router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptDBModel):
    try:
        # 1. step: analyze prompt (parsing)
        
        # 2. step: optimize it
        optimized_text = request.optimize_new_prompt_with_llm()
        
        # 3. step: calculate metrics
        initial_tokens = len(request.inputPrompt.split())
        final_tokens = len(optimized_text.split())
        
        # 4. step: return the answers
        return request
        
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


@router.post("/parsePrompt", response_model=dict)
async def parse_prompt(request: PromptDBModel):
    try:
        start_time = time.perf_counter()
        parsed_result = request.get_parsed_data_and_scores_from_llm_returns_score()
        
        optimized_result = request.optimize_new_prompt_with_llm()

        process_time = time.perf_counter() - start_time

        request.save_latency_to_firestore(process_time, optimized_result["optimizedPromptID"])
        
        return {
            "parsedData": parsed_result,
            "optimizedPrompt": optimized_result,
            "processTime" : process_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

