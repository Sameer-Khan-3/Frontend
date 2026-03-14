import { API_BASE_URL } from "../api/baseUrl";

export type DashboardMetrics = {
  employeeCount: number;
  managerCount: number;
  departmentCount: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentUsers: any[];
  topDepartments: { id: string; name: string; count: number; manager?: string | null }[];
};

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Missing auth token. Please sign in again.");
  }
  return token;
};

const parseResponseBody = async (res: Response) => {
  const rawBody = await res.text();
  if (!rawBody) return null;
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new Error(body?.message || "Failed to load dashboard metrics");
  }

  return body as DashboardMetrics;
};
