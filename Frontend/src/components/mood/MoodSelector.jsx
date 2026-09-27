import {
  Check,
} from "lucide-react";

const moods = [
  {
    value: 1,
    label: "Very Low",
    shortLabel: "Low",
    emoji: "😞",
  },
  {
    value: 2,
    label: "Low",
    shortLabel: "Down",
    emoji: "😕",
  },
  {
    value: 3,
    label: "Okay",
    shortLabel: "Okay",
    emoji: "😐",
  },
  {
    value: 4,
    label: "Good",
    shortLabel: "Good",
    emoji: "🙂",
  },
  {
    value: 5,
    label: "Great",
    shortLabel: "Great",
    emoji: "😄",
  },
];

export default function MoodSelector({
  value,
  onChange,
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">

      {moods.map((mood) => {
        const selected =
          value === mood.value;

        return (
          <button
            key={mood.value}
            type="button"
            onClick={() =>
              onChange(mood.value)
            }
            aria-pressed={selected}
            className={`
              group relative flex min-h-[100px]
              flex-col items-center justify-center
              rounded-2xl border p-3
              transition-all duration-200
              ${
                selected
                  ? "border-[#0F766E] bg-[#DFF5F1] shadow-sm"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#BFE7E1] hover:bg-[#F8FFFE]"
              }
            `}
          >

            {/* Selected mark */}
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E] text-white">
                <Check size={11} />
              </span>
            )}

            <span
              className={`
                text-3xl transition-transform duration-200
                ${
                  selected
                    ? "-translate-y-1 scale-110"
                    : "group-hover:-translate-y-1"
                }
              `}
            >
              {mood.emoji}
            </span>

            <span
              className={`
                mt-2 text-[11px] font-medium
                ${
                  selected
                    ? "text-[#0F766E]"
                    : "text-slate-500"
                }
              `}
            >
              <span className="hidden sm:inline">
                {mood.label}
              </span>

              <span className="sm:hidden">
                {mood.shortLabel}
              </span>
            </span>

          </button>
        );
      })}

    </div>
  );
}