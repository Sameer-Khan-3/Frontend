import { use, useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  UserMinus,
  Briefcase,
  UserRound,
} from "lucide-react";
import {
  DashboardMetrics,
  fetchDashboardMetrics,
} from "../services/dashboard.service";
import { useAuth } from "../context/AuthContext";

interface Role {
  name: string;
}

interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: Role | string | null;
  roles?: Array<Role | string>;
  isActive?: boolean;
  createdAt?: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

export default function Dashboard() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [topDepartments, setTopDepartments] = useState<
    { id: string; name: string; count: number; manager?: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { role, userName } = useAuth();

  const loadCounts = async () => {
    try {
      setLoading(true);
      setError("");

      const metrics: DashboardMetrics = await fetchDashboardMetrics();

      setEmployeeCount(metrics.employeeCount ?? 0);
      setManagerCount(metrics.managerCount ?? 0);
      setDepartmentCount(metrics.departmentCount ?? 0);
      setTotalUsers(metrics.totalUsers ?? 0);
      setActiveUsers(metrics.activeUsers ?? 0);
      setInactiveUsers(metrics.inactiveUsers ?? 0);
      setRecentUsers(Array.isArray(metrics.recentUsers) ? metrics.recentUsers : []);
      setTopDepartments(
        Array.isArray(metrics.topDepartments) ? metrics.topDepartments : []
      );
    } catch (err) {
      setEmployeeCount(0);
      setManagerCount(0);
      setDepartmentCount(0);
      setTotalUsers(0);
      setActiveUsers(0);
      setInactiveUsers(0);
      setRecentUsers([]);
      setTopDepartments([]);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center" role="status" aria-live="polite">
          <div
            className="h-10 w-10 rounded-full border-4 border-(--border) border-t-(--accent) animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Loading dashboard</span>
        </div>
      </div>
    );
  }

  const usersLabel = role === "Admin" ? "Total Users" : "Users (Your Dept)";
  const activeLabel = role === "Admin" ? "Active Users" : "Active (Your Dept)";
  const inactiveLabel = role === "Admin" ? "Inactive Users" : "Inactive (Your Dept)";
  const cardClass =
    "bg-(--surface) border border-(--border) p-4 rounded-2xl shadow-(--shadow-soft) hover:shadow-(--shadow-strong) transition";

  const metricCards = [
    {
      label: usersLabel,
      value: totalUsers,
      icon: Users,
      accent: "bg-emerald-500/15 text-emerald-700",
    },
    {
      label: activeLabel,
      value: activeUsers,
      icon: UserCheck,
      accent: "bg-teal-500/15 text-teal-700",
    },
    {
      label: inactiveLabel,
      value: inactiveUsers,
      icon: UserMinus,
      accent: "bg-amber-500/15 text-amber-700",
    },
    {
      label: "Employees",
      value: employeeCount,
      icon: UserRound,
      accent: "bg-indigo-500/15 text-indigo-700",
    },
    {
      label: "Managers",
      value: managerCount,
      icon: Briefcase,
      accent: "bg-sky-500/15 text-sky-700",
    },
    {
      label: "Departments",
      value: departmentCount,
      icon: Building2,
      accent: "bg-rose-500/15 text-rose-700",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-3xl border border-(--border) bg-(--surface) p-5 shadow-(--shadow-soft) md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-(--text-muted)">
            Insights
          </div>
          <h1 className="text-2xl font-semibold">Welcome back.</h1>
          <p className="text-(--text-muted)">
            Role-based metrics curated for {role || "your"} workspace.
          </p>
        </div>
        <div className="rounded-2xl bg-(--surface-2) px-4 py-3 text-sm text-(--text-muted)">
          Updated just now
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-(--shadow-soft)">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-(--text-muted)">{card.label}</div>
                  <div className="text-3xl font-semibold mt-2">{card.value}</div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Top Departments</div>
            <div className="text-xs text-(--text-muted)">By headcount</div>
          </div>
          <div className="mt-4 space-y-3">
            {topDepartments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3"
              >
                <div>
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-xs text-(--text-muted)">
                    Manager: {dept.manager || "Unassigned"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-(--accent)">{dept.count}</div>
              </div>
            ))}
            {topDepartments.length === 0 && (
              <div className="text-sm text-(--text-muted)">
                No departments available.
              </div>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Recent Users</div>
            <div className="text-xs text-(--text-muted)">Last 5</div>
          </div>
          <div className="mt-4 space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id || `${user.username}-${user.email}`}
                className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3"
              >
                <div>
                  <div className="font-medium">{user.username || "User"}</div>
                  <div className="text-xs text-(--text-muted)">
                    {typeof user.role === "string"
                      ? user.role
                      : user.role?.name || "Employee"}
                  </div>
                </div>
                <div className="text-xs text-(--text-muted)">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "--"}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-sm text-(--text-muted)">
                No recent users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
