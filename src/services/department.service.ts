import { API_BASE_URL } from "../api/baseUrl";

type UpdateDepartmentParams = {
  name?: string;
  managerId?: string | null;
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

export const fetchDepartments = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/departments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new Error(body?.message || "Failed to load departments");
  }

  return Array.isArray(body)
    ? body
    : Array.isArray(body?.departments)
    ? body.departments
    : [];
};

export const createDepartment = async (name: string) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new Error(body?.message || "Failed to create department");
  }

  return body;
};

export const updateDepartment = async (
  id: string,
  data: UpdateDepartmentParams
) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new Error(body?.message || "Failed to update department");
  }

  return body;
};

export const deleteDepartment = async (id: string) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await parseResponseBody(res);
    throw new Error(body?.message || "Failed to delete department");
  }
};
