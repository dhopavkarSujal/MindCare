import re


INTENT_PATTERNS = {
    "exam_stress": [
        r"\bexam\b",
        r"\bexams\b",
        r"\btest\b",
        r"\btests\b",
        r"\bsemester\b",
        r"\bsyllabus\b",
        r"\bstudy\b",
        r"\bstudying\b",
        r"\bmarks\b",
        r"\bgrade\b",
        r"\bresult\b",
        r"\bcollege\b"
    ],

    "anxiety": [
        r"\banxious\b",
        r"\banxiety\b",
        r"\bworry\b",
        r"\bworrying\b",
        r"\boverwhelm\b",
        r"\boverwhelmed\b",
        r"\boverthinking\b",
        r"\bpanic\b",
        r"\bnervous\b",
        r"\bscared\b"
    ],

    "loneliness": [
        r"\blonely\b",
        r"\bloneliness\b",
        r"\balone\b",
        r"\bno friends\b",
        r"\bnobody\b",
        r"\bno one\b",
        r"\bnoone\b",
        r"\bisolated\b"
    ],

    "sadness": [
        r"\bsad\b",
        r"\bsadness\b",
        r"\bcrying\b",
        r"\bempty\b",
        r"\bupset\b",
        r"\bdown\b"
    ],

    "low_motivation": [
        r"\bunmotivated\b",
        r"\bno motivation\b",
        r"\bcan't study\b",
        r"\bcant study\b",
        r"\bdon't want to study\b",
        r"\bdo not want to study\b",
        r"\bno energy\b",
        r"\bcan't do anything\b"
    ],

    "sleep_problem": [
        r"\bcan't sleep\b",
        r"\bcant sleep\b",
        r"\bcan't fall asleep\b",
        r"\bsleep\b",
        r"\binsomnia\b",
        r"\bawake all night\b"
    ],

    "anger": [
        r"\bangry\b",
        r"\banger\b",
        r"\bfrustrated\b",
        r"\bfrustration\b",
        r"\birritated\b",
        r"\bannoyed\b"
    ],

    "relationship_stress": [
        r"\bbreakup\b",
        r"\brelationship\b",
        r"\bgirlfriend\b",
        r"\bboyfriend\b",
        r"\bpartner\b",
        r"\bheartbroken\b",
        r"\bcheated\b"
    ],

    "family_stress": [
        r"\bfamily\b",
        r"\bparents\b",
        r"\bmother\b",
        r"\bfather\b",
        r"\bhome\b",
        r"\bparent\b"
    ],

    "financial_stress": [
        r"\bmoney\b",
        r"\bfinancial\b",
        r"\bfees\b",
        r"\bdebt\b",
        r"\bjob\b",
        r"\bunemployed\b"
    ]
}


def detect_intent(text: str) -> str:

    text = text.lower().strip()

    for intent, patterns in INTENT_PATTERNS.items():

        for pattern in patterns:

            if re.search(pattern, text):
                return intent

    return "general"