import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { role } = useAuth();

  return (
    <div className="flex h-screen bg-(--bg) text-(--text)">

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Right Side */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}


