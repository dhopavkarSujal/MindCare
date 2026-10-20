import time
import json
import math
import os

import httpx
from dotenv import load_dotenv

from app.prompts.system_prompt import SYSTEM_PROMPT


load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = (
    "https://openrouter.ai/api/v1/chat/completions"
)

MODEL = "openrouter/free"

# Reuse HTTP connections across AI requests.
HTTP_CLIENT = httpx.AsyncClient(timeout=60.0)

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

VALID_SENTIMENTS = {
    "positive",
    "neutral",
    "negative",
}

VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
}

VALID_ACTIONS = {
    "normal",
    "support",
    "crisis",
}


def parse_ai_json(content: str) -> dict:
    """Parse a JSON object returned by the AI."""

    if not content or not content.strip():
        raise RuntimeError(
            "OpenRouter returned an empty response."
        )

    cleaned = content.strip()

    # Remove Markdown code fences when present.
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        cleaned = "\n".join(lines).strip()

    # Try parsing the complete response.
    try:
        parsed = json.loads(cleaned)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # Try extracting a JSON object from surrounding text.
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end > start:
        candidate = cleaned[start:end + 1]

        try:
            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    # Do not include the raw model output in the error.
    raise RuntimeError(
        "OpenRouter did not return a valid JSON object."
    )


def normalize_score(value):
    """
    Accept only finite numeric scores from 0.0 to 1.0.

    Invalid or missing scores become None.
    These scores are not clinically calibrated measurements.
    """

    if isinstance(value, bool):
        return None

    if not isinstance(value, (int, float)):
        return None

    score = float(value)

    if not math.isfinite(score):
        return None

    if not 0.0 <= score <= 1.0:
        return None

    return score


def normalize_result(result: dict) -> dict:
    """Validate and normalize the AI response fields."""

    if not isinstance(result, dict):
        raise RuntimeError(
            "AI response must be a JSON object."
        )

    # Reply must be a non-empty string.
    raw_reply = result.get("reply")

    if not isinstance(raw_reply, str) or not raw_reply.strip():
        raise RuntimeError(
            "AI response is missing a valid reply."
        )

    reply = raw_reply.strip()

    # Intent is open-ended because the application
    # has multiple domain-specific intent labels.
    raw_intent = result.get("intent", "general")

    if not isinstance(raw_intent, str):
        raw_intent = "general"

    intent = raw_intent.strip().lower() or "general"
    intent = intent[:64]

    # Validate sentiment.
    sentiment = str(
        result.get("sentiment", "neutral")
    ).strip().lower()

    if sentiment not in VALID_SENTIMENTS:
        sentiment = "neutral"

    # Keep emotion as a descriptive label, not a diagnosis.
    raw_emotion = result.get("emotion", "unknown")

    if not isinstance(raw_emotion, str):
        raw_emotion = "unknown"

    emotion = raw_emotion.strip().lower() or "unknown"
    emotion = emotion[:40]

    # Validate risk level.
    risk_level = str(
        result.get("risk_level", "low")
    ).strip().lower()

    if risk_level not in VALID_RISK_LEVELS:
        risk_level = "low"

    # Validate action.
    action = str(
        result.get("action", "normal")
    ).strip().lower()

    if action not in VALID_ACTIONS:
        action = "normal"

    # A model-generated high-risk label must not
    # be paired with a normal action.
    if risk_level == "high":
        action = "crisis"
    elif risk_level == "medium" and action == "normal":
        action = "support"

    # Validate title.
    raw_title = result.get(
        "conversation_title",
        "New Support Session",
    )

    if not isinstance(raw_title, str):
        raw_title = "New Support Session"

    conversation_title = raw_title.strip()

    if not conversation_title:
        conversation_title = "New Support Session"

    conversation_title = conversation_title[:80]

    # Validate suggestions.
    raw_suggestions = result.get("suggestions", [])

    if not isinstance(raw_suggestions, list):
        raw_suggestions = []

    suggestions = []

    for item in raw_suggestions:
        if not isinstance(item, str):
            continue

        suggestion = item.strip()

        if suggestion:
            suggestions.append(suggestion[:200])

        if len(suggestions) == 4:
            break

    return {
        "reply": reply,
        "intent": intent,
        "sentiment": sentiment,
        "emotion": emotion,
        "risk_level": risk_level,
        "action": action,
        "conversation_title": conversation_title,
        "sentiment_score": normalize_score(
            result.get("sentiment_score")
        ),
        "emotion_score": normalize_score(
            result.get("emotion_score")
        ),
        "risk_score": normalize_score(
            result.get("risk_score")
        ),
        "confidence": normalize_score(
            result.get("confidence")
        ),
        "suggestions": suggestions,
    }


async def generate_ai_response(
    message: str,
    history: list[dict] | None = None,
) -> dict:
    """
    Generate a structured MindCare response using OpenRouter.
    """

    # Build the system message.
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # Add recent conversation history.
    recent_history = (history or [])[-20:]

    for item in recent_history:
        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("content", "")

        if role not in {"user", "assistant"}:
            continue

        if not isinstance(content, str):
            continue

        content = content.strip()

        if not content:
            continue

        messages.append({
            "role": role,
            "content": content,
        })

    # Add the current message exactly once.
    if not isinstance(message, str) or not message.strip():
        raise ValueError("Message cannot be empty.")

    messages.append({
        "role": "user",
        "content": message.strip(),
    })

    # Prepare the OpenRouter request.
    payload = {
        "model": MODEL,
        "messages": messages,
        "response_format": {
            "type": "json_object",
        },
        "provider": {
            "require_parameters": True,
        },
        "reasoning": {
            "effort": "low",
        },
        "max_tokens": 1200,
        "temperature": 0.2,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    
    # Send the request without printing raw response content.
    start_time = time.perf_counter()

    try:
        response = await HTTP_CLIENT.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
        )
        response.raise_for_status()

        elapsed = time.perf_counter() - start_time
        print(
            f"[AI-PERFORMANCE] openrouter_request={elapsed:.2f}s"
        )

    except httpx.HTTPError as exc:
        elapsed = time.perf_counter() - start_time
        print(
            f"[AI-PERFORMANCE] openrouter_request_failed={elapsed:.2f}s "
            f"type={type(exc).__name__}"
        )
        raise RuntimeError("OpenRouter request failed.") from None

    # Parse the provider response.
    try:
        data = response.json()
    except ValueError:
        raise RuntimeError(
            "OpenRouter returned an invalid response."
        ) from None

    if not isinstance(data, dict):
        raise RuntimeError(
            "OpenRouter returned an unexpected response."
        )

    print(
        "[AI-MODEL] "
        f"requested={MODEL} "
        f"served={data.get('model', 'unknown')}"
    )
    choices = data.get("choices")

    if not isinstance(choices, list) or not choices:
        raise RuntimeError(
            "OpenRouter response has no choices."
        )

    first_choice = choices[0]

    if not isinstance(first_choice, dict):
        raise RuntimeError(
            "OpenRouter returned an invalid choice."
        )

    message_data = first_choice.get("message")

    if not isinstance(message_data, dict):
        raise RuntimeError(
            "OpenRouter response has no valid message."
        )

    
    content = message_data.get("content")

    if not isinstance(content, str) or not content.strip():
        finish_reason = first_choice.get("finish_reason")
        refusal_present = bool(message_data.get("refusal"))
        content_type = type(content).__name__

        print(
            "[AI-DEBUG] empty_content "
            f"finish_reason={finish_reason!r} "
            f"refusal_present={refusal_present} "
            f"content_type={content_type}"
        )

        raise RuntimeError(
            "OpenRouter returned empty message content."
        )

    # Parse and validate the generated JSON.
    
    parsed = parse_ai_json(content)

    if not isinstance(parsed.get("reply"), str) or not parsed.get("reply", "").strip():
        print(
            "[AI-DEBUG] invalid_reply_field "
            f"keys={list(parsed.keys())[:20]} "
            f"reply_type={type(parsed.get('reply')).__name__} "
            f"finish_reason={first_choice.get('finish_reason')!r}"
        )

        raise RuntimeError("OpenRouter returned an invalid reply.")

    return normalize_result(parsed)