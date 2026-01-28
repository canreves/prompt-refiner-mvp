from fastapi import APIRouter
from schemas.prompt import PromptInput, PromptDBModel

router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptInput):
    # 1. optimize it with nebius.ai (will come from services/nebius_ai.py)
    optimized_text = "Yarin gercek AI cevabi gelecek..." 
    
    # 2. calculate token
    initial_tokens = len(request.input_prompt.split())
    final_tokens = len(optimized_text.split())
    
    # 3. return response (mock data for now)
    return {
        "prompt_id": "mock-id-123",
        "user_id": request.user_id,
        "input_prompt": request.input_prompt,
        "parsed_data": {"role": "Assistant", "task": "Help", "context": "General"},
        "optimized_prompt": optimized_text,
        "initial_token_size": initial_tokens,
        "final_token_size": final_tokens,
        "latency_ms": 150.5,
        "is_favorite": False
    }