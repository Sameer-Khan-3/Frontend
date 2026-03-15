import { Search, Bell, Sparkles } from "lucide-react";
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
    <header className="h-[72px] bg-(--surface) border-b border-(--border) flex items-center justify-between px-6 text-(--text) shadow-[var(--shadow-soft)]">
      {/* Search Bar */}
      <div className="hidden md:flex items-center w-1/2 max-w-xl rounded-2xl border border-(--border) bg-(--surface-2) px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <Search size={18} className="text-(--text-muted)" />
        <input
          type="text"
          placeholder="Search users, departments, projects..."
          className="bg-transparent outline-none ml-2 w-full text-sm text-(--text) placeholder:text-(--text-muted)"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface-2) text-(--text-muted) hover:text-(--accent) transition"
          >
            <Bell size={18} />
          </button>
          <ThemeToggle />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-3 py-2">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-semibold">
            {getInitials(userName)}
          </div>

          {/* Name + Role */}
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





