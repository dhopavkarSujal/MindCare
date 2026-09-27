import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export default function Journal() {
  return (
    <AppLayout activePath="/journal">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        <PageHeader
          eyebrow="Reflection"
          title="Journal"
          description="Write freely about what's on your mind."
          action={<Button>+ New Entry</Button>}
        />

        <Card>
          <h2 className="font-semibold text-[#172033]">
            Today's thoughts
          </h2>

          <textarea
            placeholder="Write whatever is on your mind..."
            className="mt-5 min-h-64 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#0F766E] focus:bg-white"
          />

          <Button className="mt-4">
            Save Entry
          </Button>
        </Card>

      </div>
    </AppLayout>
  );
}