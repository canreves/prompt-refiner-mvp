from openai import OpenAI
import json
from core.config import settings
from schemas.prompt import ParsedPrompt

import json

client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1",
    api_key=settings.NEBIUS_API_KEY,
)

def parse_prompt_with_nebius(user_input: str, ai_model : str) -> ParsedPrompt:
    """
    it analyzes the text entered by the user and separates it into
    role, task, and context. we force the output into JSON format.
    """
    system_instruction = """
    You are an AI analyst. Your task is to analyze the user's prompt and extract three components:
    1. Role: Who is acting? (e.g., "Software Engineer", "Nutritionist")
    2. Task: What is the main objective? (e.g., "Write a script", "Create a diet plan")
    3. Context: Any specific details or constraints.
    
    Output strictly in JSON format like this:
    {
        "role": "...",
        "task": "...",
        "context": "..."
    }
    """
    
    response = client.chat.completions.create(
        model=ai_model,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Analyze this prompt: {user_input}"}
        ],
        temperature=0.1, # we want salt analysis
        response_format={"type": "json_object"} # guarantees return type of json
    )
    
    # json.str -> py.str
    content = response.choices[0].message.content
    data = json.loads(content)
    
    return ParsedPrompt(
        role=data.get("role"),
        task=data.get("task"),
        context=data.get("context")
    )

def optimize_prompt_with_nebius(parsed_data: ParsedPrompt, original_input: str) -> str:
    
    # it writes the perfect prompt using parsed data.
    
    system_instruction = "You are a prompt engineering expert. Rewrite the user's request into a highly optimized, professional prompt."
    
    user_content = f"""
    Original Request: {original_input}
    
    Details:
    - Target Role: {parsed_data.role}
    - Task: {parsed_data.task}
    - Context: {parsed_data.context}
    
    Write the optimized prompt now.
    """
    
    response = client.chat.completions.create(
        model=settings.NEBIUS_MODEL,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7 
    )
    
    return response.choices[0].message.content


def test_nebius_api(prompt :str, ai_model: str = "openai/gpt-oss-20b") -> str: 
    response = client.chat.completions.create(
        model= ai_model,
        messages=[
            {
                "role" : "user",
                "content" : prompt
            }
        ]
    )

    return json.loads(response.to_json())
