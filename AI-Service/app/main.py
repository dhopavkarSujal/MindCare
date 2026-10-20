from fastapi import FastAPI
from app.services.ai import HTTP_CLIENT
import uvicorn
from app.routes.chat import router as chat_router


app = FastAPI(
    title="MindCare AI Service",
    description="AI service for the MindCare mental health support platform",
    version="1.0.0"
)


app.include_router(
    chat_router,
    prefix="/api/v1"
)


@app.get("/")
async def root():
    return {
        "message": "MindCare AI Service is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "MindCare AI"
    }

@app.on_event("shutdown")
async def close_http_client():
    await HTTP_CLIENT.aclose()

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True
    )