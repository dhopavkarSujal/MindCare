import re


HIGH_RISK_PATTERNS = [
    r"\bkill myself\b",
    r"\bwant to die\b",
    r"\bsuicide\b",
    r"\bend my life\b",
    r"\bhurt myself\b",
    r"\bself harm\b",
]


def detect_immediate_risk(text: str) -> bool:
    """
    Basic first-pass safety gate.

    Returns True when the message contains
    an explicitly high-risk phrase.
    """

    text = text.lower().strip()

    for pattern in HIGH_RISK_PATTERNS:

        if re.search(pattern, text):
            return True

    return False