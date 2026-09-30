from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
)

from app.services.ai import (
    generate_ai_response,
)


router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):

    try:

        # ==========================================
        # CONVERT HISTORY
        # ==========================================

        history = [
            {
                "role": item.role,
                "content": item.content,
            }
            for item in request.history
        ]

        # ==========================================
        # GENERATE STRUCTURED AI RESPONSE
        # ==========================================

        result = generate_ai_response(
            message=request.message,
            history=history,
        )

        # ==========================================
        # RETURN STRUCTURED RESPONSE
        # ==========================================

        return ChatResponse(
            reply=result["reply"],

            intent=result["intent"],

            sentiment=result["sentiment"],

            emotion=result["emotion"],

            risk_level=result["risk_level"],

            action=result["action"],

            conversation_title=result[
                "conversation_title"
            ],

            sentiment_score=result[
                "sentiment_score"
            ],

            emotion_score=result[
                "emotion_score"
            ],

            risk_score=result[
                "risk_score"
            ],

            confidence=result[
                "confidence"
            ],

            suggestions=result[
                "suggestions"
            ],
        )

    except Exception as exc:

        print(
            "AI chat error:",
            exc
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc