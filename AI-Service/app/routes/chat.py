
from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.response import process_message


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert Pydantic history messages into dictionaries
        # expected by the AI response pipeline.
        history = [
            {
                "role": item.role,
                "content": item.content,
            }
            for item in request.history
        ]

        # Process the current message through the MindCare pipeline.
        result = await process_message(
            message=request.message,
            history=history,
        )

        # Return a validated response using the existing schema.
        return ChatResponse(
            reply=result["reply"],
            intent=result.get("intent", "general"),
            sentiment=result.get("sentiment", "neutral"),
            emotion=result.get("emotion", "unknown"),
            risk_level=result.get("risk_level", "low"),
            action=result.get("action", "normal"),
            source=result.get("source", "llm"),
            conversation_title=result.get(
                "conversation_title",
                "New Support Session",
            ),
            sentiment_score=result.get("sentiment_score"),
            emotion_score=result.get("emotion_score"),
            risk_score=result.get("risk_score"),
            confidence=result.get("confidence"),
            suggestions=result.get("suggestions", []),
        )

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
