from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.response import process_message


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Pydantic has already normalized/validated the request. Convert history
        # to plain dictionaries for the existing response pipeline contract.
        history = [
            {
                "role": item.role,
                "content": item.content,
            }
            for item in request.history
        ]

        result = await process_message(
            message=request.message,
            history=history,
        )

        # Keep the public response shape stable while validating the complete
        # internal result in one place instead of manually copying each field.
        return ChatResponse.model_validate(result)

    except HTTPException:
        raise

    except Exception as exc:
        import traceback

        print(
            f"[AI-ERROR] type={type(exc).__name__}, "
            f"message={str(exc)[:500]}"
        )
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to process your message right now. Please try again.",
        ) from None