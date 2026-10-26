from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai import generate_ai_response
from app.services.complexity import detect_complexity
from app.services.intent import detect_intent
from app.services.response_templates import get_template_response
from app.services.risk import detect_risk
from app.services.sentiment import detect_sentiment


CRISIS_RESPONSE = """
I'm sorry you're going through something this difficult.

Your immediate safety is important. Please contact someone
you trust who can stay with you and seek immediate local
emergency or crisis support if you may be in danger.

Please do not stay alone if you feel that you may act on
these thoughts.
""".strip()


def _validated_result(result: dict) -> dict:
    """Validate every pipeline path against the public response schema."""
    return ChatResponse.model_validate(result).model_dump()


def _crisis_result() -> dict:
    """Build the stable crisis response without invoking a model."""
    return {
        "reply": CRISIS_RESPONSE,
        "intent": "crisis",
        "sentiment": "negative",
        "emotion": "unknown",
        "risk_level": "high",
        "action": "crisis",
        "source": "crisis",
        "conversation_title": "Crisis Support",
        "sentiment_score": None,
        "emotion_score": None,
        "risk_score": 1.0,
        "confidence": 1.0,
        "suggestions": [],
    }


async def process_message(message: str, history=None) -> dict:
    """Run the authoritative safety → NLP → complexity → response pipeline.

    Rule-based risk, intent, and sentiment remain authoritative for this sprint.
    All response branches are validated against ChatResponse before returning.
    """
    # Reuse the public request model so direct callers and the HTTP route share
    # identical message/history validation and normalization.
    request = ChatRequest(
        message=message,
        history=[] if history is None else history,
    )
    message = request.message
    history = [item.model_dump() for item in request.history]

    # Classify risk once. safety.py delegates to this classifier for backwards
    # compatibility, so the high-risk phrase list has a single source of truth.
    risk_level = detect_risk(message)

    if risk_level == "high":
        return _validated_result(_crisis_result())

    intent = detect_intent(message)
    sentiment = detect_sentiment(message)

    complexity = detect_complexity(
        message=message,
        intent=intent,
        risk_level=risk_level,
        history=history,
    )

    # Use canned responses only for low-risk simple messages. Medium-risk
    # messages retain model/context handling and must never be labeled normal.
    if complexity == "simple" and risk_level == "low":
        template_reply = get_template_response(intent)

        if template_reply:
            return _validated_result({
                "reply": template_reply,
                "intent": intent,
                "sentiment": sentiment,
                "emotion": "unknown",
                "risk_level": risk_level,
                "action": "normal",
                "source": "template",
                "conversation_title": "New Support Session",
                "sentiment_score": None,
                "emotion_score": None,
                "risk_score": 0.0,
                "confidence": 1.0,
                "suggestions": [],
            })

    # Only complex or medium-risk contextual messages reach the LLM.
    ai_result = await generate_ai_response(
        message=message,
        history=history,
    )

    # The application-level rule classifiers remain authoritative. Do not trust
    # an LLM-generated risk/action pair to downgrade the rule-based assessment.
    return _validated_result({
        **ai_result,
        "intent": intent,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "action": "support" if risk_level == "medium" else "normal",
        "source": "llm",
    })