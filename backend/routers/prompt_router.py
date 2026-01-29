from fastapi import APIRouter, HTTPException
from schemas.prompt import PromptInput, PromptDBModel
from services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius
# from services.firebase_db import save_prompt_to_firestore (deduct # later.)
import uuid

router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptInput):
    try:
        # 1. step: analyze prompt (parsing)
        parsed_result = parse_prompt_with_nebius(request.input_prompt)
        
        # 2. step: optimize it
        optimized_text = optimize_prompt_with_nebius(parsed_result, request.input_prompt)
        
        # 3. step: calculate metrics
        initial_tokens = len(request.input_prompt.split())
        final_tokens = len(optimized_text.split())
        
        # 4. step: return the answers
        return PromptDBModel(
            prompt_id=str(uuid.uuid4()),
            user_id=request.user_id,
            input_prompt=request.input_prompt,
            parsed_data=parsed_result,
            optimized_prompt=optimized_text,
            initial_token_size=initial_tokens,
            final_token_size=final_tokens,
            latency_ms=0.0 # now 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))