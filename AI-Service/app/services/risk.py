import re


HIGH_RISK_PATTERNS = [
    r"\bwant to die\b",
    r"\bwanted to die\b",
    r"\bdon't want to live\b",
    r"\bdo not want to live\b",
    r"\bdon't want to be alive\b",
    r"\bdo not want to be alive\b",
    r"\bcan't go on anymore\b",
    r"\bcannot go on anymore\b",
    r"\blife isn't worth living\b",
    r"\blife is not worth living\b",
    r"\bi wish i was dead\b",
    r"\bi wish i were dead\b",
    r"\bi think about ending my life\b",
    r"\bi think of ending my life\b",
    r"\bwant to kill myself\b",
    r"\bwanted to kill myself\b",
    r"\bkill myself\b",
    r"\bkill me\b",
    r"\bsuicide\b",
    r"\bend my life\b",
    r"\bhurt myself\b",
    r"\bhurting myself\b",
    r"\bself harm\b",
    r"\bself-harm\b",
]


MEDIUM_RISK_PATTERNS = [
    r"\bhopeless\b",
    r"\bhelpless\b",
    r"\bpointless\b",
    r"\bno reason to live\b",
    r"\bnothing matters\b",
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
    patterns: list[str],
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

    # Check high risk before medium risk.
    if _contains_pattern(
        text,
        HIGH_RISK_PATTERNS,
    ):
        return "high"

    if _contains_pattern(
        text,
        MEDIUM_RISK_PATTERNS,
    ):
        return "medium"

    return "low"