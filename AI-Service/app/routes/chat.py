from fastapi import APIRouter

from app.models.schemas import (
    ChatRequest,
    ChatResponse
)

from app.services.response import process_message


router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(
    request: ChatRequest
):

    history = [
        item.model_dump()
        for item in request.history
    ]

    result = process_message(
        message=request.message,
        history=history
    )

    return ChatResponse(
        **result
    )