from typing import Literal

from pydantic import BaseModel, Field


class HistoryMessage(BaseModel):
    role: Literal[
        "user",
        "assistant"
    ]

    content: str


class ChatRequest(BaseModel):

    message: str = Field(
        ...,
        min_length=1
    )

    history: list[HistoryMessage] = Field(
        default_factory=list
    )


class ChatResponse(BaseModel):

    # ==========================================
    # AI RESPONSE
    # ==========================================

    reply: str

    # ==========================================
    # NLP ANALYSIS
    # ==========================================

    intent: str

    sentiment: Literal[
        "positive",
        "neutral",
        "negative"
    ]

    emotion: str = "unknown"

    # ==========================================
    # SAFETY
    # ==========================================

    risk_level: Literal[
        "low",
        "medium",
        "high"
    ]

    action: Literal[
        "normal",
        "support",
        "crisis"
    ]

    # Identifies which response engine generated the reply.
    source: Literal[
        "template",
        "retrieval",
        "llm",
        "crisis"
    ] = "llm"

    # ==========================================
    # CONVERSATION TITLE
    # ==========================================

    conversation_title: str = "New Support Session"

    # ==========================================
    # SCORES
    # ==========================================

    sentiment_score: float | None = None

    emotion_score: float | None = None

    risk_score: float | None = None

    confidence: float | None = None

    # ==========================================
    # CONTEXT-AWARE SUGGESTIONS
    # ==========================================

    suggestions: list[str] = Field(
        default_factory=list
    )