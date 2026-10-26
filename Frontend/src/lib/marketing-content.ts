export type MarketingIconName =
  | "message-circle"
  | "activity"
  | "book-open"
  | "compass"
  | "heart"
  | "clock"
  | "leaf"
  | "lock"
  | "wind"
  | "heart-pulse"
  | "check-circle"
  | "sparkles";

export const navigationItems = [
  { label: "Explore MindCare", href: "/#inside-mindcare" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
] as const;

export const valueItems: {
  icon: MarketingIconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "heart",
    title: "Start where you are",
    description: "No perfect day or perfect words needed.",
  },
  {
    icon: "clock",
    title: "Move at your pace",
    description: "Make room for yourself in small moments.",
  },
  {
    icon: "leaf",
    title: "Grow with awareness",
    description: "Build a gentle habit of checking in.",
  },
];

export const featureItems: {
  number: string;
  icon: MarketingIconName;
  title: string;
  description: string;
  tag: string;
  tone: "mint" | "blue" | "sand" | "lilac";
}[] = [
  {
    number: "01",
    icon: "message-circle",
    title: "Talk it through",
    description:
      "Put your thoughts into words in a supportive space designed for pausing, reflecting, and feeling heard.",
    tag: "AI conversations",
    tone: "mint",
  },
  {
    number: "02",
    icon: "activity",
    title: "Understand your mood",
    description:
      "Check in regularly and start noticing patterns in how you feel over time.",
    tag: "Mood tracking",
    tone: "blue",
  },
  {
    number: "03",
    icon: "book-open",
    title: "Make room to reflect",
    description:
      "Write down what is on your mind and create a little space to understand your thoughts.",
    tag: "Guided journaling",
    tone: "sand",
  },
  {
    number: "04",
    icon: "compass",
    title: "Find your next step",
    description:
      "Explore practical wellbeing resources and find ideas that fit your everyday life.",
    tag: "Wellbeing resources",
    tone: "lilac",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Pause for a moment",
    description:
      "Start with a quick check-in. There is no right or wrong way to feel.",
  },
  {
    number: "02",
    title: "Explore what helps",
    description:
      "Choose a conversation, journal prompt, or resource that feels right for you.",
  },
  {
    number: "03",
    title: "Notice your patterns",
    description:
      "Return when you are ready and use reflection to build self-awareness over time.",
  },
] as const;

export const approachItems: {
  icon: MarketingIconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "lock",
    title: "You choose what to share",
    description:
      "Take your time and share only what you are comfortable sharing. Review the published privacy information before entering sensitive details.",
  },
  {
    icon: "wind",
    title: "No pressure to be perfect",
    description:
      "Some days you may want to reflect. Other days, a brief check-in may be enough. Both are welcome.",
  },
  {
    icon: "heart-pulse",
    title: "Support with clear limits",
    description:
      "MindCare offers wellbeing tools, not diagnosis or treatment. It cannot replace qualified professional or emergency care.",
  },
];

export const frequentlyAskedQuestions = [
  {
    question: "What is MindCare?",
    answer:
      "MindCare is a digital wellbeing space designed to help you check in with your emotions, reflect on your thoughts, and explore supportive tools such as mood tracking, journaling, AI conversations, and wellbeing resources.",
  },
  {
    question: "Is MindCare a replacement for therapy?",
    answer:
      "No. MindCare is intended for wellbeing support and self-reflection. It does not provide a diagnosis and is not a substitute for a qualified mental health professional or emergency care.",
  },
  {
    question: "Do I need to use every feature?",
    answer:
      "Not at all. You can explore the tools that feel useful to you and return at your own pace. There is no need to complete every activity or share more than you want to.",
  },
  {
    question: "Is my information private?",
    answer:
      "Please review MindCare's published privacy policy and the details of how your information is handled before sharing sensitive information. Do not enter information you are not comfortable providing.",
  },
  {
    question: "What if I need urgent help?",
    answer:
      "MindCare is not an emergency service. If you or someone else may be in immediate danger, contact your local emergency number or a qualified crisis-support service in your area.",
  },
] as const;
