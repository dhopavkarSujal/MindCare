import re


POSITIVE_WORDS = {
    "happy",
    "great",
    "good",
    "amazing",
    "excellent",
    "excited",
    "hopeful",
    "calm",
    "relaxed",
    "confident",
    "proud",
    "motivated",
    "love",
    "loving",
    "joy",
    "joyful",
    "better",
    "wonderful",
    "success",
    "successful",
}


NEGATIVE_WORDS = {
    "sad",
    "angry",
    "upset",
    "stressed",
    "stress",
    "anxious",
    "anxiety",
    "worried",
    "worry",
    "scared",
    "fear",
    "lonely",
    "loneliness",
    "hopeless",
    "helpless",
    "tired",
    "exhausted",
    "depressed",
    "empty",
    "hurt",
    "pain",
    "frustrated",
    "frustration",
    "fail",
    "failure",
    "bad",
    "terrible",
    "awful",
    "crying",
    "cry",
    "overwhelmed",
}


def _clean_text(text: str) -> list[str]:
    """
    Convert text into lowercase word tokens.
    """

    return re.findall(
        r"\b[a-z']+\b",
        text.lower()
    )


def detect_sentiment(text: str) -> str:
    """
    Basic rule-based sentiment classification.

    Returns:
        positive
        neutral
        negative
    """

    words = _clean_text(text)

    positive_score = sum(
        1
        for word in words
        if word in POSITIVE_WORDS
    )

    negative_score = sum(
        1
        for word in words
        if word in NEGATIVE_WORDS
    )

    if negative_score > positive_score:
        return "negative"

    if positive_score > negative_score:
        return "positive"

    return "neutral"