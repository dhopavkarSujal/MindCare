import {
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

const moodInfo = {
  1: {
    emoji: "😞",
    label: "Very Low",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  2: {
    emoji: "😕",
    label: "Low",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  3: {
    emoji: "😐",
    label: "Okay",
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
  4: {
    emoji: "🙂",
    label: "Good",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
  5: {
    emoji: "😄",
    label: "Great",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
};

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function MoodCard({
  mood,
}) {
  const score = Number(mood?.score) || 0;

  const info =
    moodInfo[score] || {
      emoji: "🙂",
      label: "Unknown",
      bg: "bg-slate-100",
      text: "text-slate-600",
    };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start gap-4">

        {/* Mood */}
        <div
          className={`
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-2xl text-2xl
            ${info.bg}
          `}
        >
          {info.emoji}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center justify-between gap-2">

            <div>

              <h3 className="text-sm font-semibold text-[#172033]">
                {info.label}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">

                <CalendarDays size={13} />

                <span>
                  {formatDate(
                    mood?.createdAt ||
                    mood?.created_at
                  )}
                </span>

              </div>

            </div>

            <span
              className={`
                rounded-full px-2.5 py-1
                text-xs font-semibold
                ${info.bg} ${info.text}
              `}
            >
              {score} / 5
            </span>

          </div>

          {/* Note */}
          {mood?.note && (
            <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 px-3 py-2.5">

              <MessageSquareText
                size={14}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-500">
                {mood.note}
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}