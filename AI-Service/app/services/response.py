from app.services.ai import generate_ai_response
from app.services.intent import detect_intent
from app.services.risk import detect_risk
from app.services.safety import detect_immediate_risk
from app.services.sentiment import detect_sentiment


CRISIS_RESPONSE = """
I'm sorry you're going through something this difficult.

Your immediate safety is important. Please contact someone
you trust who can stay with you and seek immediate local
emergency or crisis support if you may be in danger.

Please do not stay alone if you feel that you may act on
these thoughts.
"""
def process_message(
    message: str,
    history: list[dict]
) -> dict:

    # Run safety and classification before response generation.
    is_high_risk = detect_immediate_risk(message)

    if is_high_risk:
        return {
            "reply": CRISIS_RESPONSE.strip(),
            "intent": "crisis",
            "sentiment": "negative",
            "emotion": "unknown",
            "risk_level": "high",
            "action": "crisis",
            "conversation_title": "Crisis Support",
            "sentiment_score": None,
            "emotion_score": None,
            "risk_score": 1.0,
            "confidence": 1.0,
            "suggestions": [],
        }

    intent = detect_intent(message)
    sentiment = detect_sentiment(message)
    risk_level = detect_risk(message)

    # Use the LLM as the fallback while the router is being built.
    ai_result = generate_ai_response(
        message=message,
        history=history,
    )

    return {
        **ai_result,
        "intent": intent,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "action": (
            "support"
            if risk_level == "medium"
            else "normal"
        ),
    }