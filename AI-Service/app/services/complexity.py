# Classify message complexity without making another LLM request.

def detect_complexity(
    message: str,
    intent: str,
    risk_level: str,
    history: list[dict],
) -> str:

    text = message.strip()

    word_count = len(text.split())
    sentence_count = (
        text.count(".")
        + text.count("?")
        + text.count("!")
    )

    # Safety always has priority.
    if risk_level == "high":
        return "critical"

    # Medium risk requires contextual handling.
    if risk_level == "medium":
        return "complex"

    # Long messages usually need the LLM.
    if word_count > 60:
        return "complex"

    # Multiple sentences may indicate a complex situation.
    if sentence_count >= 4:
        return "complex"

    simple_intents = {
        "exam_stress",
        "anxiety",
        "loneliness",
        "low_motivation",
        "sleep_problem",
        "coping_strategy",
    }

    if intent in simple_intents:
        return "simple"

    return "complex"