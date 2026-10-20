from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


# Keep request limits aligned with the model context handling. These limits
# guard the public API without changing its field names or success response.
MAX_MESSAGE_LENGTH = 4000
MAX_HISTORY_MESSAGES = 10
MAX_HISTORY_MESSAGE_LENGTH = 4000


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=MAX_HISTORY_MESSAGE_LENGTH)

    @field_validator("content", mode="before")
    @classmethod
    def strip_history_content(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_MESSAGE_LENGTH,
    )
    history: list[HistoryMessage] = Field(
        default_factory=list,
        max_length=MAX_HISTORY_MESSAGES,
    )

    @field_validator("message", mode="before")
    @classmethod
    def strip_message(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class ChatResponse(BaseModel):
    # AI response
    reply: str

    # NLP analysis
    intent: str
    sentiment: Literal["positive", "neutral", "negative"]
    emotion: str = "unknown"

    # Safety
    risk_level: Literal["low", "medium", "high"]
    action: Literal["normal", "support", "crisis"]

    # Response engine provenance
    source: Literal["template", "retrieval", "llm", "crisis"] = "llm"

    # Conversation title
    conversation_title: str = "New Support Session"

    # Scores are normalized to the [0, 1] range by the AI adapter. They are
    # heuristic/model signals and are not clinically calibrated probabilities.
    sentiment_score: float | None = Field(default=None, ge=0.0, le=1.0)
    emotion_score: float | None = Field(default=None, ge=0.0, le=1.0)
    risk_score: float | None = Field(default=None, ge=0.0, le=1.0)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)

    # Context-aware suggestions
    suggestions: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def keep_safety_action_consistent(self):
        """Prevent a high-risk response from being labeled as normal support."""
        if self.risk_level == "high":
            self.action = "crisis"
        elif self.risk_level == "medium" and self.action == "normal":
            self.action = "support"
        return self
