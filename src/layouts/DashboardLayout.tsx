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
    <div className="min-h-screen overflow-x-hidden bg-(--bg) text-(--text)">

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Right Side */}
      <div className="ml-72 min-h-screen min-w-0 overflow-x-hidden">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="px-4 pb-6 pt-[96px]">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}


