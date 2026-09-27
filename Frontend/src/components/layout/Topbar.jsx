import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">

      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFF5F1]">
          <span className="text-sm font-bold text-[#0F766E]">
            M
          </span>
        </div>

        <span className="font-semibold text-[#172033]">
          MindCare
        </span>
      </div>

      {/* Desktop search */}
      <div className="hidden md:flex relative w-72">

        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F766E] focus:bg-white"
        />

      </div>

      <div className="ml-auto flex items-center gap-3">

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
          <Bell size={19} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
        </button>

        <div className="h-7 w-px bg-slate-200" />

        <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFF5F1] text-sm font-semibold text-[#0F766E]">
            S
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-[#172033]">
              Sujal
            </p>

            <p className="text-[11px] text-slate-400">
              Student
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 sm:block"
          />

        </button>

      </div>
    </header>
  );
}