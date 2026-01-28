from fastapi import FastAPI
from routers import prompt_router

app = FastAPI(title="Prompt Refiner MVP", version="1.0")

# Router'ı sisteme dahil et
app.include_router(prompt_router.router, prefix="/api/v1", tags=["Prompts"])

@app.get("/")
def read_root():
    return {"status": "System Operational", "architecture": "Modular"}