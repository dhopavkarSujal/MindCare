import json
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


GENERIC_TITLES = {
    "general support",
    "support",
    "general conversation",
    "conversation",
    "chat",
    "new support session",
}


def parse_ai_json(content: str) -> dict:
    """
    Convert the LLM response into a Python dictionary.

    Handles:
    - normal JSON
    - JSON wrapped in ```json ... ```
    - accidental surrounding text
    """

    if not content:
        raise RuntimeError(
            "OpenRouter returned an empty response."
        )

    cleaned = content.strip()

    # ------------------------------------------
    # Remove Markdown code fences
    # ------------------------------------------

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        cleaned = "\n".join(lines).strip()

    # ------------------------------------------
    # Try normal JSON first
    # ------------------------------------------

    try:
        parsed = json.loads(cleaned)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # ------------------------------------------
    # Try extracting the JSON object
    # ------------------------------------------

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = cleaned[
            start:end + 1
        ]

        try:

            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    raise RuntimeError(
        f"OpenRouter did not return valid JSON: {content}"
    )


def normalize_result(result: dict) -> dict:
    """
    Ensure the response contains the fields
    expected by FastAPI and Node.
    """

    reply = str(
        result.get("reply", "")
    ).strip()

    if not reply:
        raise RuntimeError(
            "AI response is missing 'reply'."
        )

    intent = str(
        result.get(
            "intent",
            "general_support"
        )
    ).strip().lower()

    sentiment = str(
        result.get(
            "sentiment",
            "neutral"
        )
    ).strip().lower()

    emotion = str(
        result.get(
            "emotion",
            "unknown"
        )
    ).strip().lower()

    risk_level = str(
        result.get(
            "risk_level",
            "low"
        )
    ).strip().lower()

    action = str(
        result.get(
            "action",
            "normal"
        )
    ).strip().lower()

    conversation_title = str(
        result.get(
            "conversation_title",
            "New Support Session"
        )
    ).strip()

    suggestions = result.get(
        "suggestions",
        []
    )

    if not isinstance(
        suggestions,
        list
    ):
        suggestions = []

    suggestions = [
        str(item).strip()
        for item in suggestions
        if str(item).strip()
    ][:4]

    return {
        "reply": reply,
        "intent": intent,
        "sentiment": sentiment,
        "emotion": emotion,
        "risk_level": risk_level,
        "action": action,
        "conversation_title": conversation_title,
        "sentiment_score": result.get(
            "sentiment_score"
        ),
        "emotion_score": result.get(
            "emotion_score"
        ),
        "risk_score": result.get(
            "risk_score"
        ),
        "confidence": result.get(
            "confidence"
        ),
        "suggestions": suggestions,
    }


def generate_ai_response(
    message: str,
    history: list[dict],
) -> dict:
    """
    Generate a structured MindCare response.

    The LLM receives:
    - MindCare system instructions
    - previous conversation history
    - current user message

    The LLM returns structured JSON containing:
    - reply
    - intent
    - sentiment
    - emotion
    - risk
    - title
    - suggestions
    """

    # ==========================================
    # BUILD MESSAGE LIST
    # ==========================================

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # ==========================================
    # ADD CONVERSATION HISTORY
    # ==========================================

    recent_history = history[-20:]

    for item in recent_history:

        role = item.get("role")

        content = str(
            item.get("content", "")
        ).strip()

        if role not in {
            "user",
            "assistant",
        }:
            continue

        if not content:
            continue

        messages.append({
            "role": role,
            "content": content,
        })

    # ==========================================
    # ADD CURRENT USER MESSAGE
    # ==========================================

    messages.append({
        "role": "user",
        "content": message.strip(),
    })

    # ==========================================
    # OPENROUTER REQUEST
    # ==========================================

    payload = {
        "model": MODEL,

        "messages": messages,

        "response_format": {
            "type": "json_object"
        },

        "provider": {
            "require_parameters": True
        },

        "reasoning": {
            "effort": "low"
        },

        "max_tokens": 1200,

        "temperature": 0.2,
    }

    headers = {
        "Authorization": (
            f"Bearer {OPENROUTER_API_KEY}"
        ),

        "Content-Type": "application/json",
    }

    response = None

    try:

        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
            )

        response.raise_for_status()

    except httpx.HTTPError as exc:

        print(
            "\n========== OPENROUTER ERROR RESPONSE =========="
        )

        if response is not None:
            print(response.text)
        else:
            print("No HTTP response received.")

        print(
            "===============================================\n"
        )

        raise RuntimeError(
            f"OpenRouter request failed: {exc}"
        ) from exc

    # ==========================================
    # READ OPENROUTER RESPONSE
    # ==========================================

    data = response.json()

    print(
        "\n========== OPENROUTER RAW RESPONSE =========="
    )
    print(data)
    print(
        "============================================\n"
    )

    # ==========================================
    # CHECK RESPONSE STRUCTURE
    # ==========================================

    choices = data.get("choices")

    if not choices:
        raise RuntimeError(
            f"OpenRouter response has no choices: {data}"
        )

    first_choice = choices[0]

    if not first_choice:
        raise RuntimeError(
            f"OpenRouter returned an empty choice: {data}"
        )

    message_data = first_choice.get(
        "message"
    )

    if not message_data:
        raise RuntimeError(
            f"OpenRouter choice has no message: {data}"
        )

    content = message_data.get(
        "content"
    )

    if not content or not str(
        content
    ).strip():

        raise RuntimeError(
            f"OpenRouter returned empty "
            f"message content: {data}"
        )

    # ==========================================
    # PARSE STRUCTURED JSON
    # ==========================================

    parsed = parse_ai_json(
        content
    )

    # ==========================================
    # NORMALIZE RESULT
    # ==========================================

    result = normalize_result(
        parsed
    )

    print(
        "\n========== NORMALIZED AI RESULT =========="
    )
    print(result)
    print(
        "==========================================\n"
    )

    return result