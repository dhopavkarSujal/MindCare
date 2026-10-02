# Classify message complexity without making another LLM request.

def detect_complexity(
    message: str,
    intent: str,
    risk_level: str,
    history: list[dict],
) -> str:

    text = message.strip()

    word_count = len(text.split())
    sentence_count = text.count(".") + text.count("?") + text.count("!")

    # Safety takes priority over complexity.
    if risk_level == "high":
        return "critical"

    # Medium-risk messages should receive contextual handling.
    if risk_level == "medium":
        return "complex"

    # Long messages usually require more context.
    if word_count > 60:
        return "complex"

    # Multiple sentences can indicate a multi-part situation.
    if sentence_count >= 4:
        return "complex"

    # These intents are currently suitable for local templates.
    simple_intents = {
        "exam_stress",
        "anxiety",
        "loneliness",
        "low_motivation",
        "sleep_problem",
    }

    if intent in simple_intents:
        return "simple"

    return "complex"