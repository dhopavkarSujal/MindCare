import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  // Get user information from AuthContext
  const fullName =
  user?.fullName ||
  user?.supabaseUser?.user_metadata?.full_name ||
  "User";
  const role = user?.role || "Student";

  // Get first letter for avatar
  const avatarLetter = fullName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-5 sm:px-6">

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
      <div className="relative hidden w-72 md:flex">
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

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <Bell size={19} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
        </button>

        <div className="h-7 w-px bg-slate-200" />

        {/* User */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFF5F1] text-sm font-semibold text-[#0F766E]">
            {avatarLetter}
          </div>

          {/* User details */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-[#172033]">
              {fullName}
            </p>

            <p className="text-[11px] capitalize text-slate-400">
              {role}
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