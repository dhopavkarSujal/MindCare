import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Save,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import Card from "../components/common/Card";
import Button from "../components/common/Button";

import MoodSelector from "../components/mood/MoodSelector";
import MoodCard from "../components/mood/MoodCard";
import MoodChart from "../components/mood/MoodChart";

import {
  getMoods,
  createMood,
} from "../services/mood.service";

export default function Mood() {

  const [selectedMood, setSelectedMood] =
    useState(null);

  const [note, setNote] =
    useState("");

  const [moods, setMoods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Load moods
   */
  const loadMoods = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getMoods();

        console.log(
          "Mood API response:",
          response
        );

        /*
         * Supports both:
         *
         * response.data
         *
         * and
         *
         * response
         */
        const data =
          response?.data ??
          response ??
          [];

        setMoods(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Failed to load moods:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load your mood history."
        );

      } finally {
        setLoading(false);
      }

    },
    []
  );

  useEffect(() => {
    loadMoods();
  }, [loadMoods]);

  /*
   * Save mood
   */
  const handleSaveMood = async () => {

    if (!selectedMood) {
      setError(
        "Please select how you are feeling."
      );
      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      await createMood({
        score: selectedMood,
        note: note.trim(),
      });

      setSuccess(
        "Your mood has been saved."
      );

      setSelectedMood(null);
      setNote("");

      await loadMoods();

      /*
       * Remove success message automatically.
       */
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {

      console.error(
        "Failed to save mood:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save your mood."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout activePath="/mood">

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">

        {/* Page heading */}
        <section className="mb-8">

          <p className="mb-1 text-sm font-medium text-[#0F766E]">
            Wellbeing
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#172033] sm:text-3xl">
            Mood
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Check in with yourself and understand
            how your mood changes over time.
          </p>

        </section>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs font-medium hover:underline"
            >
              Dismiss
            </button>

          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✓ {success}
          </div>
        )}

        {/* Top grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">

          {/* Check-in */}
          <Card>

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F1]">
                <Activity
                  size={19}
                  className="text-[#0F766E]"
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#172033]">
                  How are you feeling today?
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Choose the mood that best describes
                  how you feel right now.
                </p>
              </div>

            </div>

            <div className="mt-7">
              <MoodSelector
                value={selectedMood}
                onChange={setSelectedMood}
              />
            </div>

            {/* Note */}
            <div className="mt-6">

              <label className="text-sm font-medium text-slate-600">
                Optional note
              </label>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                maxLength={500}
                rows={4}
                placeholder="What's on your mind today?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#0F766E] focus:bg-white focus:ring-4 focus:ring-[#DFF5F1]/60"
              />

              <div className="mt-1 text-right text-[10px] text-slate-400">
                {note.length}/500
              </div>

            </div>

            <Button
              className="mt-4"
              loading={saving}
              disabled={!selectedMood}
              onClick={handleSaveMood}
            >
              <Save size={16} />
              Save Mood
            </Button>

          </Card>

          {/* Chart */}
          <Card>

            <div className="mb-2 flex items-start justify-between">

              <div>
                <h2 className="font-semibold text-[#172033]">
                  Your Mood
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  A look at your recent check-ins.
                </p>
              </div>

              <span className="rounded-full bg-[#DFF5F1] px-3 py-1.5 text-[11px] font-medium text-[#0F766E]">
                7 days
              </span>

            </div>

            {loading ? (
              <div className="mt-6 flex h-64 items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-[#DFF5F1]" />

                  <p className="mt-3 text-xs text-slate-400">
                    Loading mood history...
                  </p>

                </div>

              </div>
            ) : (
              <MoodChart moods={moods} />
            )}

          </Card>

        </div>

        {/* History */}
        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <h2 className="text-lg font-semibold text-[#172033]">
                Recent Check-ins
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your latest mood records.
              </p>
            </div>

            {moods.length > 0 && (
              <span className="text-xs text-slate-400">
                {moods.length} entries
              </span>
            )}

          </div>

          {loading ? (
            <div className="space-y-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-white"
                />
              ))}

            </div>
          ) : moods.length === 0 ? (

            <Card>

              <div className="py-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DFF5F1]">
                  <Activity
                    size={21}
                    className="text-[#0F766E]"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-[#172033]">
                  No mood entries yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Your mood history will appear here
                  after you record your first check-in.
                </p>

              </div>

            </Card>

          ) : (

            <div className="space-y-3">

              {[...moods]
                .sort(
                  (a, b) =>
                    new Date(
                      b.createdAt ||
                      b.created_at ||
                      0
                    ) -
                    new Date(
                      a.createdAt ||
                      a.created_at ||
                      0
                    )
                )
                .slice(0, 10)
                .map((mood, index) => (
                  <MoodCard
                    key={
                      mood.id ||
                      `${mood.score}-${index}`
                    }
                    mood={mood}
                  />
                ))}

            </div>

          )}

        </section>

      </div>

    </AppLayout>
  );
}