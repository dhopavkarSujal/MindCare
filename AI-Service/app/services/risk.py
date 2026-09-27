import re


HIGH_RISK_PATTERNS = [
    r"\bkill myself\b",
    r"\bwant to die\b",
    r"\bsuicide\b",
    r"\bend my life\b",
    r"\bhurt myself\b",
    r"\bself harm\b",
    r"\bself-harm\b",
    r"\bgoing to kill myself\b",
    r"\bgoing to die\b",
]


MEDIUM_RISK_PATTERNS = [
    r"\bhopeless\b",
    r"\bhelpless\b",
    r"\bpointless\b",
    r"\bno reason to live\b",
    r"\bnothing matters\b",
    r"\bcan't go on\b",
    r"\bcant go on\b",
    r"\bfeel like giving up\b",
    r"\bgiving up\b",
    r"\bwant to disappear\b",
    r"\bdon't want to be here\b",
    r"\bdont want to be here\b",
    r"\bworthless\b",
    r"\bcompletely alone\b",
]


def _contains_pattern(
    text: str,
    patterns: list[str]
) -> bool:

    for pattern in patterns:

        if re.search(pattern, text):
            return True

    return False


def detect_risk(text: str) -> str:
    """
    Basic application-level risk classifier.

    Returns:
        low
        medium
        high

    This is NOT a clinical assessment.
    """

    text = text.lower().strip()

    # Highest priority first
    if _contains_pattern(
        text,
        HIGH_RISK_PATTERNS
    ):
        return "high"

    if _contains_pattern(
        text,
        MEDIUM_RISK_PATTERNS
    ):
        return "medium"

    return "low"