import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1",
    api_key=os.environ.get("NEBIUS_API_KEY"),
)

def optimize_prompt_with_nebius(input_text: str):
    """
    basic optimization step will be done here!
    """
    # we will be writing prompt engineering code here.
    response = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-70B-Instruct",
        messages=[
            {"role": "system", "content": "You are a prompt engineer expert. Refine the following prompt..."},
            {"role": "user", "content": input_text}
        ]
    )
    return response.choices[0].message.content