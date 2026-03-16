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
    <div className="flex min-h-screen bg-(--bg) text-(--text)">

      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Right Side */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 px-4 pb-2 pt-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}


