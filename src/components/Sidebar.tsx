import {
  LayoutDashboard,Users,FolderKanban,CheckSquare,Settings,LogOut,Briefcase,Building2
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppRole } from "../utils/role";

interface SidebarProps {
  role: AppRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const { signOut } = useAuth();
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
      roles: ["Admin", "Manager"],
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
    <aside className="w-64 bg-(--surface) border-r border-(--border) h-screen flex flex-col text-(--text)">

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b font-bold text-lg">
        RBAC System
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item, index) => (
            <div
              key={index}
              onClick={() => Navigate(item.path)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--surface-2) cursor-pointer"
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-(--border)">
        <button
          type="button"
          onClick={handleLogOut}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
