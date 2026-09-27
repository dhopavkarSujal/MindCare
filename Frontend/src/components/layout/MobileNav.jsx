import {
  Home,
  MessageCircle,
  HeartPulse,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Chat",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    label: "Mood",
    icon: HeartPulse,
    path: "/mood",
  },
  {
    label: "Profile",
    icon: User,
    path: "/profile",
  },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">

      <div className="mx-auto flex max-w-md justify-around">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex min-w-[70px] flex-col items-center gap-1 px-3 py-3 text-[10px] font-medium
                transition
                ${
                  isActive
                    ? "text-[#0F766E]"
                    : "text-slate-400"
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

      </div>

    </nav>
  );
}