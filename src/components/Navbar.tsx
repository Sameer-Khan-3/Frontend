import { Search, Bell } from "lucide-react";
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
    <header className="h-16 bg-(--surface) border-b border-(--border) flex items-center justify-between px-6 text-(--text)">

      {/* Search Bar */}
      <div className="flex items-center w-1/3 `bg-(--surface-2) rounded-lg px-3 py-2">
        <Search size={18} className="text-(--text-muted)" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-2 w-full text-sm text-(--text) placeholder:text-(--text-muted)"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-(--text-muted) cursor-pointer" />
          <ThemeToggle />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            {getInitials(userName)}
          </div>

          {/* Name + Role */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              {userName}
            </span>

            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded w-fit">
              {role}
            </span>
          </div>

        </div>

      </div>

    </header>
  );
}





