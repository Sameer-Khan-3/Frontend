import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const getInitials = (name: string) => {
    const clean = name.trim();
    if (!clean) return "U";
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const { userName, role } = useAuth();

  return (
    <header className="fixed inset-x-0 left-72 top-0 z-30 flex h-[72px] items-center justify-end border-b border-(--border) bg-(--surface)/95 px-6 text-(--text) shadow-(--shadow-soft) backdrop-blur">
      <div className="flex items-center gap-6">
        <ThemeToggle />

        <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-3 py-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-semibold">
            {getInitials(userName)}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              {userName}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-(--accent) bg-(--accent-soft) px-2 py-0.5 rounded-full w-fit">
              <Sparkles size={12} />
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}





