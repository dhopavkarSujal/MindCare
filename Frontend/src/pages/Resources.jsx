import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";

const resources = [
  ["Managing Exam Stress", "5 min read", "Stress"],
  ["Better Sleep Habits", "4 min read", "Sleep"],
  ["Understanding Anxiety", "6 min read", "Anxiety"],
  ["Building Healthy Study Habits", "7 min read", "Study"],
];

export default function Resources() {
  return (
    <AppLayout activePath="/resources">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        <PageHeader
          eyebrow="Learn & Grow"
          title="Resources"
          description="Helpful resources for stress, sleep, wellbeing and student life."
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "Stress", "Sleep", "Anxiety", "Study"].map(
            (tag) => (
              <button
                key={tag}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
              >
                {tag}
              </button>
            )
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {resources.map(([title, time, category]) => (
            <Card
              key={title}
              className="group transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-xs font-medium text-[#0F766E]">
                {category}
              </span>

              <h2 className="mt-3 text-lg font-semibold text-[#172033]">
                {title}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                {time}
              </p>

              <button className="mt-6 text-sm font-medium text-[#0F766E]">
                Read article →
              </button>
            </Card>
          ))}

        </div>

      </div>

    </AppLayout>
  );
}