import {
  LayoutDashboard,
  MessageCircle,
  HeartPulse,
  BookOpen,
  Library,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "AI Chat",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    label: "Mood",
    icon: HeartPulse,
    path: "/mood",
  },
  {
    label: "Journal",
    icon: BookOpen,
    path: "/journal",
  },
  {
    label: "Resources",
    icon: Library,
    path: "/resources",
  },
];

export default function Sliderbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="hidden w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF5F1]">
            <Sparkles
              size={20}
              className="text-[#0F766E]"
            />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-[#172033]">
              MindCare
            </h1>

            <p className="text-[11px] text-slate-400">
              Your space to breathe
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl
                  px-3 py-2.5
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#DFF5F1] text-[#0F766E]"
                      : "text-[#64748B] hover:bg-slate-50 hover:text-[#172033]"
                  }
                `}
              >
                <Icon size={19} />

                <span>{item.label}</span>

                {item.label === "AI Chat" && (
                  <span className="ml-auto rounded-full bg-[#0F766E] px-2 py-0.5 text-[9px] font-bold text-white">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}

        </div>

        <div className="my-6 border-t border-slate-100" />

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Account
        </p>

        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
            ${
              isActive
                ? "bg-[#DFF5F1] text-[#0F766E]"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#172033]"
            }
          `}
        >
          <Settings size={19} />
          Settings
        </NavLink>

      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
          Logout
        </button>

      </div>

    </aside>
  );
}