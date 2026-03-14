export type AppRole = "Admin" | "Manager" | "Employee";

export const normalizeRole = (rawRole?: string | null): AppRole | null => {
  if (!rawRole) return null;

  const value = rawRole.trim().toLowerCase();
  if (value === "admin") return "Admin";
  if (value === "manager") return "Manager";
  if (value === "employee") return "Employee";

  return null;
};
