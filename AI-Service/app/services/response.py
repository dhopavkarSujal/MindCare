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
):
    """
    Main MindCare AI pipeline.

    Flow:

        Message
            ↓
        Safety
            ↓
        Intent
            ↓
        Sentiment
            ↓
        Risk
            ↓
        AI Response
    """

    # ==========================================
    # 1. IMMEDIATE SAFETY CHECK
    # ==========================================

    is_high_risk = detect_immediate_risk(
        message
    )

    if is_high_risk:

        return {
            "reply": CRISIS_RESPONSE.strip(),
            "intent": "crisis",
            "sentiment": "negative",
            "risk_level": "high",
            "action": "crisis"
        }

    # ==========================================
    # 2. INTENT DETECTION
    # ==========================================

    intent = detect_intent(
        message
    )

    # ==========================================
    # 3. SENTIMENT DETECTION
    # ==========================================

    sentiment = detect_sentiment(
        message
    )

    # ==========================================
    # 4. RISK DETECTION
    # ==========================================

    risk_level = detect_risk(
        message
    )

    # ==========================================
    # 5. AI RESPONSE
    # ==========================================

    reply = generate_ai_response(
        message=message,
        history=history,
        intent=intent,
        sentiment=sentiment,
        risk_level=risk_level
    )

    # ==========================================
    # 6. FINAL RESULT
    # ==========================================

    action = "normal"

    if risk_level == "medium":
        action = "support"

    return {
        "reply": reply,
        "intent": intent,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "action": action
    }