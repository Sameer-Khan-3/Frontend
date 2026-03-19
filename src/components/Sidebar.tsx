import {
  LayoutDashboard,Users,FolderKanban,CheckSquare,Settings,LogOut,Briefcase,Building2
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppRole } from "../utils/role";

interface SidebarProps {
  role: AppRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["Admin", "Manager", "Employee"],
      path:"/dashboard",
    },
    {
      name: "User Management",
      icon: <Briefcase size={18} />,
      roles: ["Admin", "Manager", "Employee"],
      path:"/employees",
    },
    {
      name: "Departments",
        icon: <Building2 size={18} />,
        roles: ["Admin"],
        path: "/departments",
    },
    {
      name: "Projects",
      icon: <FolderKanban size={18} />,
      roles: ["Manager", "Employee"],
      path:"/projects",
    },
    {
      name: "Settings",
      icon: <Settings size={18} />,
      roles: ["Admin"],
      path:"/settings",
    },
  ];
  const Navigate = useNavigate();
const handleLogOut = () => {
  signOut();
  Navigate("/signin");
};
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-(--border) bg-(--surface) text-(--text)">

      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-(--border) px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-(--accent) text-white flex items-center justify-center font-semibold shadow-(--shadow-soft)">
            RB
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-(--text-muted)">Console</div>
            <div className="text-lg font-semibold leading-tight">RBAC Studio</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={index}
                onClick={() => Navigate(item.path)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-(--accent-soft) text-(--accent) shadow-(--shadow-soft)"
                    : "text-(--text) hover:bg-(--surface-2)"
                }`}
              >
                <span className={`${isActive ? "text-(--accent)" : "text-(--text-muted)"} transition`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-(--border)">
        <button
          type="button"
          onClick={handleLogOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
