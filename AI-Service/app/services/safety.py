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


def detect_immediate_risk(text: str) -> bool:
    text = text.lower().strip()

    for pattern in HIGH_RISK_PATTERNS:
        if re.search(pattern, text):
            return True

    return False