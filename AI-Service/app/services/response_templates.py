import random


RESPONSE_TEMPLATES = {
    "exam_stress": [
        "It sounds like your exam is putting you under a lot of pressure. Try focusing on one small topic at a time instead of thinking about the entire syllabus at once.",
        "Exam stress can make everything feel bigger than it is. Pick one manageable task, study for a short focused period, and then take a brief break.",
        "If your exam is tomorrow, focus on the most important topics rather than trying to cover everything.",
    ],

    "anxiety": [
        "It sounds like you're feeling anxious right now. Try taking a few slow breaths and focus on what you can control in this moment.",
        "When anxiety feels overwhelming, breaking the situation into one small step can make it easier to handle.",
        "Take a moment to slow things down. You don't need to solve everything at once.",
    ],
    "coping_strategy": [
        "Try taking a few slow breaths and relaxing your shoulders. You can also step away for a few minutes, drink some water, or take a short walk.",
        "Give yourself a short break. Try slow breathing, listen to something calming, or take a few minutes away from whatever is stressing you.",
        "Start with one simple calming activity, such as slow breathing, stretching, or taking a short walk.",
    ],
    "loneliness": [
        "Feeling lonely can be difficult. If possible, consider reaching out to someone you trust.",
        "It sounds like you're feeling disconnected. Starting with one small connection can help.",
        "Consider whether there is someone you feel comfortable talking to today.",
    ],

    "low_motivation": [
        "When motivation is low, try choosing one very small task and completing just that.",
        "You don't need to finish everything right now. Pick the easiest useful task and start there.",
        "Start with something small enough that it feels easy to begin.",
    ],

    "sleep_problem": [
        "If you're having trouble sleeping, try reducing stimulation before bed and give yourself some quiet time to wind down.",
        "A consistent sleep routine can make it easier to settle down at night.",
        "If your mind is racing at night, writing down your thoughts may help you put them aside temporarily.",
    ],
}
def get_template_response(intent: str) -> str | None:
    # Return a varied response for supported common intents.
    responses = RESPONSE_TEMPLATES.get(intent)

    if not responses:
        return None

    return random.choice(responses)