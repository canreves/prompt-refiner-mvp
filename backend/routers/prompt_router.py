from fastapi import APIRouter, HTTPException
from firebase_admin import firestore

# from schemas.prompt import PromptInput, PromptDBModel
import sys
from pathlib import Path

try:
    from schemas.prompt import PromptDBModel, PromptInput
    from services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius, test_nebius_api
    from services.firebase_db import get_firestore_client
except ImportError:
    # Add parent directory to path when running directly
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from schemas.prompt import PromptDBModel, PromptInput
    from services.nebius_ai import parse_prompt_with_nebius, optimize_prompt_with_nebius, test_nebius_api
    from services.firebase_db import get_firestore_client
    
import uuid
import time

router = APIRouter()

@router.post("/optimize", response_model=PromptDBModel)
async def optimize_prompt(request: PromptInput):
    try:
        start_time = time.time()
        
        # 1. step: analyze prompt (parsing)
        parsed_result = parse_prompt_with_nebius(request.inputPrompt, "meta-llama/Llama-3.3-70B-Instruct")
        
        # 2. step: optimize it
        optimized_text = optimize_prompt_with_nebius(parsed_result, request.inputPrompt)
        
        # 3. step: calculate metrics
        initial_tokens = len(request.inputPrompt.split())
        final_tokens = len(optimized_text.split())
        
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000
        
        prompt_id = str(uuid.uuid4())
        
        # 4. step: create the prompt model
        prompt_model = PromptDBModel(
            promptID=prompt_id,
            userID=request.userID,
            projectID="default-project",
            inputPrompt=request.inputPrompt,
            parsedData=parsed_result,
            optimizedPrompts={"default": optimized_text},
            initialTokenSize=initial_tokens,
            finalTokenSizes={"default": final_tokens},
            latencyMs={"default": latency_ms}
        )
        
        # 5. step: save to firestore
        prompt_model.set_to_firestore()
        
        return prompt_model
        
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


@router.get("/history/{user_id}")
async def get_prompt_history(user_id: str, limit: int = 50):
    """
    Get prompt history for a specific user
    """
    try:
        db = get_firestore_client()
        prompts_ref = db.collection("prompts")
        # Query prompts for this user, order by createdAt descending
        query = prompts_ref.where("userID", "==", user_id).limit(limit)
        docs = query.stream()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            # Handle timestamp conversion
            created_at = data.get("createdAt")
            if hasattr(created_at, 'isoformat'):
                created_at = created_at.isoformat()
            
            history.append({
                "id": data.get("promptID"),
                "prompt": data.get("inputPrompt"),
                "optimizedPrompt": data.get("optimizedPrompts", {}).get("default", ""),
                "timestamp": created_at,
                "tokenCount": data.get("initialTokenSize", 0),
                "latency": data.get("latencyMs", {}).get("default", 0),
            })
        
        # Sort by timestamp in Python (descending)
        history.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
        
        return {"status": "success", "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/prompt/{prompt_id}")
async def delete_prompt(prompt_id: str):
    """
    Delete a prompt from history
    """
    try:
        db = get_firestore_client()
        prompt_ref = db.collection("prompts").document(prompt_id)
        prompt_ref.delete()
        return {"status": "success", "message": f"Prompt {prompt_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feedback")
async def save_feedback(feedback_data: dict):
    """
    Save user rating for a prompt (1-5)
    
    Request body:
    {
        "promptID": "...",
        "rating": 5  // number between 1-5
    }
    """
    try:
        db = get_firestore_client()
        
        # Validate rating
        rating = feedback_data.get("rating")
        if not rating or not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be a number between 1 and 5")
        
        # Update prompt with rating directly
        if feedback_data.get("promptID"):
            prompt_ref = db.collection("prompts").document(feedback_data["promptID"])
            prompt_ref.update({
                "ratings": {"user": int(rating)}
            })
            return {"status": "success", "promptID": feedback_data["promptID"]}
        else:
            raise HTTPException(status_code=400, detail="promptID is required")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/prompt/{prompt_id}/favorite")
async def toggle_favorite(prompt_id: str, data: dict):
    """
    Toggle favorite status of a prompt
    """
    try:
        db = get_firestore_client()
        prompt_ref = db.collection("prompts").document(prompt_id)
        prompt_ref.update({"isFavorite": data.get("isFavorite", False)})
        return {"status": "success", "message": "Favorite status updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



