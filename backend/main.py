from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import prompt_router, user_router

app = FastAPI(title="Prompt Refiner MVP", version="1.0")

# cors settings (to be able to talk with frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # give access to everyone for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# include router to the system
app.include_router(prompt_router.router, prefix="/api/v1", tags=["Prompts"])
app.include_router(user_router.router, prefix="/api/v1", tags=["Users"])

@app.get("/")
def read_root():
    return {"status": "System Operational", "architecture": "Modular"}