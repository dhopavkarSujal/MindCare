import os

import httpx
from dotenv import load_dotenv

from app.prompts.system_prompt import SYSTEM_PROMPT


load_dotenv()


OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

OPENROUTER_URL = (
    "https://openrouter.ai/api/v1/chat/completions"
)

MODEL = "openrouter/free"


if not OPENROUTER_API_KEY:
    raise RuntimeError(
        "OPENROUTER_API_KEY is missing from .env"
    )


def generate_ai_response(
    message: str,
    history: list[dict],
    intent: str,
    sentiment: str,
    risk_level: str
) -> str:
    """
    Generate MindCare response through OpenRouter.

    The model receives:

    - MindCare system instructions
    - internal intent
    - internal sentiment
    - internal risk level
    - recent conversation history
    - current user message
    """

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # ==========================================
    # INTERNAL ANALYSIS CONTEXT
    # ==========================================

    analysis_context = f"""
Internal analysis for the current message:

Intent: {intent}
Sentiment: {sentiment}
Risk level: {risk_level}

Instructions:

- Use these signals to make the response more relevant.
- Never reveal these internal classifications to the user.
- Never describe them as medical diagnoses.
- Never tell the user that they have a mental-health disorder.
"""

    messages.append({
        "role": "system",
        "content": analysis_context
    })

    # ==========================================
    # CONVERSATION HISTORY
    # ==========================================

    recent_history = history[-20:]

    for item in recent_history:

        messages.append({
            "role": item["role"],
            "content": item["content"]
        })

    # ==========================================
    # CURRENT MESSAGE
    # ==========================================

    messages.append({
        "role": "user",
        "content": message
    })

    # ==========================================
    # OPENROUTER REQUEST
    # ==========================================

    payload = {
        "model": MODEL,
        "messages": messages
    }

    headers = {
        "Authorization": (
            f"Bearer {OPENROUTER_API_KEY}"
        ),
        "Content-Type": "application/json"
    }

    try:

        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload
            )

        response.raise_for_status()

    except httpx.HTTPError as exc:

        raise RuntimeError(
            f"OpenRouter request failed: {exc}"
        ) from exc

    # ==========================================
    # PARSE RESPONSE
    # ==========================================

    data = response.json()

    try:

        reply = data[
            "choices"
        ][0][
            "message"
        ][
            "content"
        ]

    except (
        KeyError,
        IndexError,
        TypeError
    ) as exc:

        raise RuntimeError(
            f"Unexpected OpenRouter response: {data}"
        ) from exc

    return reply.strip()