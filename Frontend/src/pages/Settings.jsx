import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";

export default function Settings() {
  return (
    <AppLayout activePath="/settings">

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">

        <PageHeader
          eyebrow="Preferences"
          title="Settings"
          description="Manage your MindCare preferences."
        />

        <div className="space-y-4">

          <Card>

            <h2 className="font-semibold text-[#172033]">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Control how MindCare keeps you informed.
            </p>

            <label className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-sm text-slate-600">
                Mood reminders
              </span>

              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[#0F766E]"
              />
            </label>

          </Card>

          <Card>

            <h2 className="font-semibold text-[#172033]">
              Appearance
            </h2>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Theme
              </span>

              <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                <option>Light</option>
                <option>System</option>
              </select>
            </div>

          </Card>

        </div>

      </div>

    </AppLayout>
  );
}