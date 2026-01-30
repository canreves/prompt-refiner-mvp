from openai import OpenAI
import json
from core.config import settings
from schemas.prompt import ParsedPrompt

import json

client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1",
    api_key=settings.NEBIUS_API_KEY
)

def parse_prompt_with_nebius(user_input: str, ai_model : str = settings.NEBIUS_MODEL) -> ParsedPrompt:
    """
    it analyzes the text entered by the user and separates it into
    role, task, and context. we force the output into JSON format.
    """
    system_instruction = """
    You are a Senior Prompt Engineer. Your task is dividing given prompt in terms of Task, Role,
    Style, Output, Rules and Context, then scoring each aspect out of 10 based on how well they are constructed.
    DO NOT FORGET ANY ASPECT AND SCORE. DO NOT CHANGE THE PROMPT WHEN DIVIDING IT.
    If any aspect is missing in the user's prompt, give 0 score for that aspect and leave the field empty or null.
    
    Output strictly in JSON format:
    {
        "task": "extracted task aspect or null",
        "task_score": 0-10,
        "role": "extracted role aspect or null",
        "role_score": 0-10,
        "style": "extracted style aspect or null",
        "style_score": 0-10,
        "output": "extracted output format aspect or null",
        "output_score": 0-10,
        "rules": "extracted rules/constraints aspect or null",
        "rules_score": 0-10,
        "context": "extracted context aspect or null",
        "context_score": 0-10
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
        task=data.get("task"),
        task_score=data.get("task_score", 0),
        role=data.get("role"),
        role_score=data.get("role_score", 0),
        style=data.get("style"),
        style_score=data.get("style_score", 0),
        output=data.get("output"),
        output_score=data.get("output_score", 0),
        rules=data.get("rules"),
        rules_score=data.get("rules_score", 0),
        context=data.get("context"),
        context_score=data.get("context_score", 0)
    )

def optimize_prompt_with_nebius(original_input: str) -> dict:
    """
    Takes raw user input and creates an optimized, professional prompt in JSON format.
    Returns a dict with task, role, style, output, rules, context fields.
    """
    system_instruction = """You are a Senior Prompt Engineering Expert. 
    Your task is to rewrite the user's request into a highly optimized, professional prompt.
    
    You MUST output the optimized prompt in JSON format with these fields:
    {
        "task": "The specific task or objective (what to do)",
        "role": "The role or persona the AI should adopt",
        "style": "The tone, style, or approach to use",
        "output": "The expected output format and structure",
        "rules": "Any constraints, rules, or requirements to follow",
        "context": "Background information or context needed"
    }
    
    Each field should contain detailed, professional content. If a field is not applicable, use null.
    Output ONLY valid JSON, nothing else."""
    
    user_content = f"""Optimize this prompt into structured JSON format:
    
    \"\"\"{original_input}\"\"\""""
    
    response = client.chat.completions.create(
        model=settings.NEBIUS_MODEL,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}  # Forces JSON output
    )
    
    content = response.choices[0].message.content
    return json.loads(content)


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

