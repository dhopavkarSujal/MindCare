import {
  Send,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

const QUICK_SUGGESTIONS = [
  "I'm feeling stressed",
  "I can't concentrate",
  "I'm feeling anxious",
  "I feel lonely",
  "I need someone to talk to",
  "I need help with my studies",
  "I can't sleep",
  "I'm overthinking",
  "How can I relax?",
  "Help me make a study plan",
];

const COMMON_CORRECTIONS = {
  // -----------------------------
  // Common contractions
  // -----------------------------
  im: "I'm",
  ive: "I've",
  id: "I'd",
  ill: "I'll",
  cant: "can't",
  cannot: "cannot",
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  wont: "won't",
  wouldnt: "wouldn't",
  couldnt: "couldn't",
  shouldnt: "shouldn't",
  havent: "haven't",
  hasnt: "hasn't",
  hadnt: "hadn't",
  doesnt: "doesn't",
  youre: "you're",
  your: "your",
  theyre: "they're",
  thats: "that's",
  whats: "what's",
  whos: "who's",
  hows: "how's",
  lets: "let's",

  // -----------------------------
  // Common chat abbreviations
  // -----------------------------
  u: "you",
  ur: "your",
  urs: "yours",
  pls: "please",
  plz: "please",
  thx: "thanks",
  ty: "thank you",
  tysm: "thank you so much",
  np: "no problem",
  btw: "by the way",
  idk: "I don't know",
  imo: "in my opinion",
  asap: "as soon as possible",
  bc: "because",
  bcs: "because",
  bcz: "because",
  coz: "because",
  cuz: "because",
  rn: "right now",
  tmro: "tomorrow",
  tmrw: "tomorrow",
  tmr: "tomorrow",
  ppl: "people",
  sth: "something",
  somthing: "something",

  // -----------------------------
  // Common everyday typos
  // -----------------------------
  teh: "the",
  adn: "and",
  taht: "that",
  thsi: "this",
  witht: "with",
  waht: "what",
  hwo: "how",
  becuase: "because",
  beacuse: "because",
  becasue: "because",
  becaus: "because",
  recive: "receive",
  recieve: "receive",
  definately: "definitely",
  definatly: "definitely",
  seperate: "separate",
  alot: "a lot",
  tommorow: "tomorrow",
  tomorow: "tomorrow",
  untill: "until",
  throught: "through",
  dontt: "don't",
  didntt: "didn't",
  doesnts: "doesn't",

  // -----------------------------
  // Stress / anxiety related
  // -----------------------------
  stres: "stress",
  stresed: "stressed",
  stresed: "stressed",
  stressd: "stressed",
  stressingg: "stressing",
  anxous: "anxious",
  anxeous: "anxious",
  anxios: "anxious",
  anxity: "anxiety",
  anxeity: "anxiety",
  anxiouss: "anxious",
  worryed: "worried",
  worriedd: "worried",
  scaredd: "scared",
  panicng: "panicking",
  panicing: "panicking",
  panik: "panic",
  overthiking: "overthinking",
  overthinkng: "overthinking",
  overthinkingg: "overthinking",
  overthnk: "overthink",
  calmm: "calm",

  // -----------------------------
  // Study / exam related
  // -----------------------------
  exm: "exam",
  examm: "exam",
  exams: "exams",
  asignment: "assignment",
  assigment: "assignment",
  assignement: "assignment",
  colage: "college",
  collage: "college",
  clg: "college",
  stydy: "study",
  studing: "studying",
  studdy: "study",
  concetrate: "concentrate",
  concentate: "concentrate",
  concenrate: "concentrate",
  concenterate: "concentrate",
  motivaton: "motivation",
  motvation: "motivation",
  memorise: "memorize",
  memorey: "memory",
  learnng: "learning",
  revisionn: "revision",

  // -----------------------------
  // Sleep / loneliness related
  // -----------------------------
  slep: "sleep",
  sleepng: "sleeping",
  sleeep: "sleep",
  insomia: "insomnia",
  insomniya: "insomnia",
  lonelyy: "lonely",
  lonley: "lonely",
  lonly: "lonely",
  frnd: "friend",
  freind: "friend",
  freindship: "friendship",

  // -----------------------------
  // General emotional words
  // -----------------------------
  saded: "sad",
  happyness: "happiness",
  angryy: "angry",
  confusd: "confused",
  confusedd: "confused",
  depresed: "depressed",
  embaressed: "embarrassed",
  embarassed: "embarrassed",
  frustratd: "frustrated",
  frustrted: "frustrated",
  disapointed: "disappointed",
  disapponted: "disappointed",
  embarasing: "embarrassing",

  // -----------------------------
  // Common question words
  // -----------------------------
  whay: "why",
  wht: "what",
  wen: "when",
  wer: "where",
  wich: "which",
  wch: "which",
  becouse: "because",
  pleas: "please",
  plaese: "please",
};

export default function ChatInput({
  onSend,
  disabled = false,
  hasConversation = true,
}) {
  const [message, setMessage] =
    useState("");

  const [
    activeSuggestion,
    setActiveSuggestion,
  ] = useState(0);

  const isDisabled =
    disabled || !hasConversation;

  /*
   * Autocomplete suggestions
   */
  const autocompleteSuggestions =
    useMemo(() => {
      const query =
        message.trim().toLowerCase();

      if (
        !query ||
        query.length < 2 ||
        isDisabled
      ) {
        return [];
      }

      return QUICK_SUGGESTIONS
        .filter((suggestion) =>
          suggestion
            .toLowerCase()
            .includes(query)
        )
        .slice(0, 4);
    }, [
      message,
      isDisabled,
    ]);

  /*
   * Simple typo/contraction suggestion
   */
  const correction =
  useMemo(() => {
    if (!message.trim()) {
      return null;
    }

    const words =
      message.split(/(\s+)/);

    let hasCorrection = false;

    const correctedWords =
      words.map((word) => {
        if (!word.trim()) {
          return word;
        }

        const leading =
          word.match(/^[^a-zA-Z]*/)?.[0] || "";

        const trailing =
          word.match(/[^a-zA-Z!?.,;:'-]*$/)?.[0] || "";

        const core =
          word
            .replace(/^[^a-zA-Z]*/, "")
            .replace(/[^a-zA-Z!?.,;:'-]*$/, "");

        const punctuationMatch =
          core.match(/[!?.,;:']+$/);

        const punctuation =
          punctuationMatch
            ? punctuationMatch[0]
            : "";

        const cleanWord =
          core
            .replace(/[!?.,;:']+$/, "")
            .toLowerCase();

        const corrected =
          COMMON_CORRECTIONS[
            cleanWord
          ];

        if (
          corrected &&
          corrected.toLowerCase() !==
            cleanWord
        ) {
          hasCorrection = true;

          return (
            leading +
            corrected +
            punctuation +
            trailing
          );
        }

        return word;
      });

    if (!hasCorrection) {
      return null;
    }

    return {
      correct:
        correctedWords.join(""),
    };
  }, [message]);

  const submitMessage = () => {
    const trimmed =
      message.trim();

    if (
      !trimmed ||
      isDisabled
    ) {
      return;
    }

    onSend(trimmed);
    setMessage("");
    setActiveSuggestion(0);
  };

  const selectAutocomplete =
    (suggestion) => {
      setMessage(suggestion);
      setActiveSuggestion(0);
    };

  const applyCorrection = () => {
    if (!correction) {
      return;
    }

    setMessage(
      correction.correct
    );

    setActiveSuggestion(0);
  };

  const handleKeyDown = (
    event
  ) => {
    /*
     * Navigate autocomplete
     */
    if (
      autocompleteSuggestions.length >
      0
    ) {
      if (
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        setActiveSuggestion(
          (current) =>
            (current + 1) %
            autocompleteSuggestions.length
        );

        return;
      }

      if (
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        setActiveSuggestion(
          (current) =>
            (current -
              1 +
              autocompleteSuggestions.length) %
            autocompleteSuggestions.length
        );

        return;
      }

      /*
       * Enter selects autocomplete
       * instead of immediately sending.
       */
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        selectAutocomplete(
          autocompleteSuggestions[
            activeSuggestion
          ]
        );

        return;
      }
    }

    /*
     * Normal send behavior
     */
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">

        {/* Autocomplete */}
        {autocompleteSuggestions.length >
          0 && (
          <div className="mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Suggestions
            </div>

            {autocompleteSuggestions.map(
              (
                suggestion,
                index
              ) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(
                    event
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    selectAutocomplete(
                      suggestion
                    )
                  }
                  className={`block w-full border-t border-slate-100 px-3 py-2.5 text-left text-xs transition ${
                    activeSuggestion ===
                    index
                      ? "bg-[#F0FDFA] text-[#0F766E]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        {/* Spell / correction suggestion */}
        {correction && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
            <p className="text-[11px] text-slate-600">
              Did you mean{" "}
              <span className="font-semibold text-slate-800">
                {correction.correct}
              </span>
              ?
            </p>
            <button
              type="button"
              onClick={
                applyCorrection
              }
              className="text-[11px] font-semibold text-[#0F766E] hover:underline"
            >
              Use
            </button>
          </div>
        )}

        <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-[#0F766E] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#DFF5F1]/60">

          <textarea
            value={message}
            onChange={(event) => {
              setMessage(
                event.target.value
              );
              setActiveSuggestion(0);
            }}
            onKeyDown={
              handleKeyDown
            }
            disabled={isDisabled}
            rows={1}
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
            placeholder={
              !hasConversation
                ? "Start or select a conversation..."
                : disabled
                  ? "MindCare is responding..."
                  : "Type a message..."
            }
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={
              submitMessage
            }
            disabled={
              isDisabled ||
              !message.trim()
            }
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F766E] text-white transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 active:scale-95"
          >
            <Send size={17} />
          </button>

        </div>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          Enter to send • Shift + Enter for a new line
        </p>

      </div>
    </div>
  );
}