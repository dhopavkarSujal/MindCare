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
        r"\bgrades\b",
        r"\bresult\b",
        r"\bresults\b",
        r"\bcollege exam\b",
        r"\bexam stress\b",
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
        r"\bpanicking\b",
        r"\bnervous\b",
        r"\bscared\b",
    ],

    "loneliness": [
        r"\blonely\b",
        r"\bloneliness\b",
        r"\bfeel alone\b",
        r"\bfeeling alone\b",
        r"\bno friends\b",
        r"\bnobody\b",
        r"\bno one\b",
        r"\bnoone\b",
        r"\bisolated\b",
        r"\bfeel disconnected\b",
    ],

    "sadness": [
        r"\bsad\b",
        r"\bsadness\b",
        r"\bcrying\b",
        r"\bempty\b",
        r"\bupset\b",
        r"\bfeeling down\b",
        r"\bfeel down\b",
    ],

    "low_motivation": [
        r"\bunmotivated\b",
        r"\bno motivation\b",
        r"\bcan't study\b",
        r"\bcant study\b",
        r"\bdon't want to study\b",
        r"\bdo not want to study\b",
        r"\bno energy\b",
        r"\bcan't do anything\b",
        r"\bcant do anything\b",
        r"\bcan't get started\b",
        r"\bcan't focus\b",
        r"\bcant focus\b",
    ],

    "sleep_problem": [
        r"\bcan't sleep\b",
        r"\bcant sleep\b",
        r"\bcan't fall asleep\b",
        r"\bcant fall asleep\b",
        r"\binsomnia\b",
        r"\bawake all night\b",
        r"\btrouble sleeping\b",
        r"\bhaving trouble sleeping\b",
    ],

    "coping_strategy": [
        r"\bhow can i relax\b",
        r"\bhow do i relax\b",
        r"\bhelp me relax\b",
        r"\bways to relax\b",
        r"\bhow can i calm down\b",
        r"\bhow do i calm down\b",
        r"\bhelp me calm down\b",
        r"\bcalm down\b",
        r"\brelaxation\b",
        r"\bbreathing exercise\b",
        r"\bbreathing exercises\b",
        r"\bhow can i cope\b",
        r"\bhow do i cope\b",
        r"\bhow can i manage stress\b",
        r"\bhow do i manage stress\b",
    ],

    "anger": [
        r"\bangry\b",
        r"\banger\b",
        r"\bfrustrated\b",
        r"\bfrustration\b",
        r"\birritated\b",
        r"\bannoyed\b",
    ],

    "relationship_stress": [
        r"\bbreakup\b",
        r"\brelationship\b",
        r"\bgirlfriend\b",
        r"\bboyfriend\b",
        r"\bpartner\b",
        r"\bheartbroken\b",
        r"\bcheated\b",
        r"\bcheating\b",
    ],

    "family_stress": [
        r"\bfamily\b",
        r"\bparents\b",
        r"\bmother\b",
        r"\bfather\b",
        r"\bparent\b",
        r"\bparental pressure\b",
        r"\bparents expect\b",
    ],

    "financial_stress": [
        r"\bmoney problems\b",
        r"\bfinancial stress\b",
        r"\bfinancial problem\b",
        r"\bfees\b",
        r"\bdebt\b",
        r"\bunemployed\b",
        r"\bcan't afford\b",
        r"\bcant afford\b",
    ],
}


def detect_intent(text: str) -> str:
    text = text.lower().strip()

    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text):
                return intent

    return "general"