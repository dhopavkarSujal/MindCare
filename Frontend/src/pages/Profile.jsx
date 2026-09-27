import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export default function Profile() {
  return (
    <AppLayout activePath="/profile">

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">

        <PageHeader
          eyebrow="Account"
          title="Profile"
          description="Manage your personal information."
        />

        <Card>

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF5F1] text-xl font-semibold text-[#0F766E]">
              S
            </div>

            <div>
              <h2 className="font-semibold text-[#172033]">
                Sujal
              </h2>

              <p className="text-sm text-slate-400">
                Student
              </p>
            </div>

          </div>

          <div className="space-y-5">

            <div>
              <label className="text-sm font-medium text-slate-600">
                Full Name
              </label>

              <input
                defaultValue="Sujal"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0F766E] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Email
              </label>

              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0F766E] focus:bg-white"
              />
            </div>

          </div>

          <Button className="mt-6">
            Save Changes
          </Button>

        </Card>

      </div>

    </AppLayout>
  );
}