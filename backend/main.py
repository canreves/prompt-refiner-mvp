from fastapi import FastAPI
import os
from dotenv import load_dotenv

# loading .env
load_dotenv()

app = FastAPI(title="Prompt Refiner MVP", version="1.0")

@app.get("/")
def read_root():
    return {"status": "System Operational", "message": "Backend is running!"}

# /log- prompt will come here.