import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

import {
  getMoods,
  createMood,
} from "../services/mood.service";

const moods = [
  { value: 1, label: "Low", emoji: "😞" },
  { value: 2, label: "Down", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😄" },
];

export default function Dashboard() {

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodsData, setMoodsData] = useState([]);
  const [loadingMoods, setLoadingMoods] = useState(true);
  const [savingMood, setSavingMood] = useState(false);
  const [moodError, setMoodError] = useState("");
  const [moodSuccess, setMoodSuccess] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

    const loadMoods = useCallback(
    async () => {
      try {
        setLoadingMoods(true);
        setMoodError("");

        const response =
          await getMoods();

        console.log(
          "GET /api/moods response:",
          response
        );

        setMoodsData(
          response.data || []
        );

      } catch (error) {
        console.error(
          "Failed to load moods:",
          error
        );

        setMoodError(
          error?.response?.data?.message ||
            error.message ||
            "Unable to load mood data."
        );

      } finally {
        setLoadingMoods(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMoods();
  }, [loadMoods]);

    const handleSaveMood = async () => {
    if (!selectedMood) {
      return;
    }

    try {
      setSavingMood(true);
      setMoodError("");
      setMoodSuccess("");

      const response = await createMood({
        score: selectedMood,
        note: "",
      });

      console.log(
        "POST /api/moods response:",
        response
      );

      setMoodSuccess(
        "Mood saved successfully."
      );

      setSelectedMood(null);

      await loadMoods();

    } catch (error) {
      console.error(
        "Failed to save mood:",
        error
      );

      setMoodError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to save mood."
      );
    } finally {
      setSavingMood(false);
    }
  };
  

  return (
    <AppLayout activePath="/dashboard">

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">

        {authSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {authSuccess}
          </div>
        )}

        {/* Greeting */}
        <section className="mb-8">

          <p className="mb-1 text-sm font-medium text-[#0F766E]">
            Welcome back
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
            Good afternoon, Sujal
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
            Take a moment for yourself. You can talk, reflect, or simply
            check in with how you're feeling today.
          </p>

        </section>

        {/* Mood */}
        <Card className="mb-6">

          <div className="mb-6">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFF5F1]">
                <Activity
                  size={18}
                  className="text-[#0F766E]"
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#172033]">
                  How are you feeling today?
                </h2>

                <p className="text-xs text-[#94A3B8]">
                  A quick check-in takes less than a minute.
                </p>
              </div>

            </div>

          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">

            {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() =>
                setSelectedMood(mood.value)
              }
              className={`
                group flex w-16 flex-col items-center gap-2
                rounded-2xl border p-3 transition-all duration-200

                ${
                  selectedMood === mood.value
                    ? "border-[#0F766E] bg-[#DFF5F1] shadow-sm scale-105"
                    : "border-transparent hover:border-[#DFF5F1] hover:bg-[#F8FFFE]"
                }
              `}
            >
              <span
                className={`
                  text-3xl transition-transform duration-200
                  ${
                    selectedMood === mood.value
                      ? "-translate-y-1"
                      : "group-hover:-translate-y-1"
                  }
                `}
              >
                {mood.emoji}
              </span>

              <span
                className={`
                  text-[11px] font-medium
                  ${
                    selectedMood === mood.value
                      ? "text-[#0F766E]"
                      : "text-slate-400"
                  }
                `}
              >
                {mood.label}
              </span>
            </button>
            ))}

          </div>

          <div className="mt-5">
            <Button
              loading={savingMood}
              disabled={!selectedMood}
              onClick={handleSaveMood}
            >
              Save Mood
            </Button>
            
          </div>

        </Card>

        {/* Main actions */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Chat */}
          <Card className="group relative overflow-hidden">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#DFF5F1] opacity-60 blur-2xl" />

            <div className="relative">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E] text-white">
                <MessageCircle size={21} />
              </div>

              <h2 className="text-lg font-semibold text-[#172033]">
                Talk to MindCare
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
                Continue a conversation or start a new private space to
                talk about what's on your mind.
              </p>
              <Button
                className="mt-6"
                onClick={() => navigate("/chat")}
              >
                Open Chat
                <ArrowRight size={16} />
              </Button>

            </div>

          </Card>

          {/* Mood overview */}
          <Card>

            <div className="flex items-start justify-between">

              <div>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F5F9]">
                  <TrendingUp
                    size={21}
                    className="text-[#0F766E]"
                  />
                </div>

                <h2 className="text-lg font-semibold text-[#172033]">
                  Mood Overview
                </h2>

                <p className="mt-2 text-sm text-[#64748B]">
                  Your recent mood pattern
                </p>

              </div>

              <span className="rounded-full bg-[#DFF5F1] px-2.5 py-1 text-xs font-medium text-[#0F766E]">
                7 days
              </span>

            </div>

            {loadingMoods ? (
              <div className="mt-6 flex h-24 items-center justify-center">
                <p className="text-sm text-slate-400">
                  Loading your mood history...
                </p>
              </div>
            ) : moodsData.length === 0 ? (
              <div className="mt-6 flex h-24 items-center justify-center rounded-xl bg-slate-50">
                <p className="text-sm text-slate-400">
                  No mood entries yet.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex h-24 items-end gap-2">

                {moodsData
                  .slice(0, 7)
                  .reverse()
                  .map((mood, index) => {

                    const height =
                      (mood.score / 5) * 100;

                    return (
                      <div
                        key={mood.id || index}
                        className="flex flex-1 items-end"
                      >
                        <div
                          style={{
                            height: `${height}%`,
                          }}
                          className="
                            w-full rounded-t-lg
                            bg-[#DFF5F1]
                            transition-all duration-500
                            hover:bg-[#0F766E]
                          "
                        />
                      </div>
                    );
                  })}

              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

              <div>
                <p className="text-xs text-slate-400">
                  Recorded moods
                </p>

                <p className="mt-1 text-lg font-semibold text-[#172033]">
                  {moodsData.length}
                </p>
              </div>

              <Link
                to="/mood"
                className="flex items-center gap-1 text-sm font-medium text-[#0F766E]"
              >
                View details
                <ArrowRight size={15} />
              </Link>

            </div>

          </Card>

        </div>

        {/* Recent activity */}
        <Card className="mt-5">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-[#172033]">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Your latest MindCare activity
              </p>
            </div>

            <button className="text-sm font-medium text-[#0F766E]">
              View all
            </button>

          </div>

          <div className="divide-y divide-slate-100">

            {[
              {
                title: "Mood recorded",
                time: "Today",
                icon: Activity,
              },
              {
                title: "Chat session",
                time: "Yesterday",
                icon: MessageCircle,
              },
              {
                title: "Journal entry",
                time: "Monday",
                icon: TrendingUp,
              },
            ].map((item) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 py-4"
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
                    <Icon
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#172033]">
                      {item.title}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    {item.time}
                  </span>

                </div>
              );
            })}

          </div>

        </Card>

      </div>

    </AppLayout>
  );
}