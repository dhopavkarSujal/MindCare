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

    reply: str

    intent: str

    sentiment: Literal[
        "positive",
        "neutral",
        "negative"
    ]

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