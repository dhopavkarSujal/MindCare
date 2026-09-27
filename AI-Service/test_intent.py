from app.services.intent import detect_intent


def main():

    tests = [
        "I am stressed about my exams.",
        "I keep overthinking everything.",
        "I feel very lonely.",
        "I don't feel motivated to study.",
        "I can't sleep at night.",
        "I am really angry today.",
        "My relationship is causing me stress.",
        "I am having problems with my family.",
        "I am worried about money.",
        "Hello, how are you?"
    ]

    print("\n===== INTENT TEST =====\n")

    for message in tests:

        intent = detect_intent(message)

        print(f"Message : {message}")
        print(f"Intent  : {intent}")
        print("----------------------")


if __name__ == "__main__":
    main()