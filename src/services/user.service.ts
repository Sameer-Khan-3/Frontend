import { API_BASE_URL } from "../api/baseUrl";
import { AppRole } from "../utils/role";

type CreateUserParams = {
  username: string;
  email: string;
  password: string;
  role?: string;
  departmentId?: string | null;
};

type UpdateUserParams = {
  username: string;
  email: string;
  role?: string;
  isActive?: boolean;
  departmentId?: string | null;
};

const getOptionalToken = () => localStorage.getItem("token");

const getAuthToken = () => {
  const token = getOptionalToken();
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

const buildUsersUrl = (endpoint: string, search: string) => {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }
  const query = params.toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

export const fetchUsers = async (role: AppRole, search: string) => {
  const token = getAuthToken();
  const endpoints =
    role === "Admin"
      ? [`${API_BASE_URL}/users`, `${API_BASE_URL}/users/department`]
      : [`${API_BASE_URL}/users/department`, `${API_BASE_URL}/users`];

  let lastErrorMessage = "Failed to fetch users";

  for (const endpoint of endpoints) {
    const res = await fetch(buildUsersUrl(endpoint, search), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await parseResponseBody(res);

    if (res.ok) {
      const usersList = Array.isArray(body?.users || body)
        ? body.users || body
        : [];
      return usersList;
    }

    const message =
      body?.message || `${res.status} ${res.statusText}` || "Failed to fetch users";
    lastErrorMessage = message;

    if (res.status === 403) {
      continue;
    }

    if (
      res.status === 400 &&
      endpoint.endsWith("/users/department") &&
      typeof message === "string" &&
      message.toLowerCase().includes("not assigned")
    ) {
      return [];
    }

    throw new Error(message);
  }

  throw new Error(lastErrorMessage);
};

export const fetchDepartments = async (role: AppRole) => {
  if (role !== "Admin" && role !== "Manager") {
    return [];
  }

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

export const fetchManagerDepartmentId = async () => {
  try {
    const token = getOptionalToken();
    if (!token) {
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const body = await parseResponseBody(res);
    return body?.department?.id ?? null;
  } catch {
    return null;
  }
};

export const updateUser = async (id: string, data: UpdateUserParams) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    const message =
      body?.message || `${res.status} ${res.statusText}` || "Failed to update user";
    throw new Error(message);
  }

  return body;
};

export const assignUserToDepartment = async (
  userId: string,
  departmentId: string
) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/departments/assign-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      departmentId,
    }),
  });

  const body = await parseResponseBody(res);

  if (!res.ok) {
    const message =
      body?.message ||
      `${res.status} ${res.statusText}` ||
      "Failed to assign user to department";
    throw new Error(message);
  }
};

export const createUser = async (params: CreateUserParams) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: params.username,
      email: params.email,
      password: params.password,
    }),
  });

  const createdUser = await parseResponseBody(res);

  if (!res.ok) {
    const message =
      createdUser?.message ||
      `${res.status} ${res.statusText}` ||
      "Failed to create user";
    throw new Error(message);
  }

  if (params.role && params.role !== "Employee") {
    await updateUser(createdUser.id, {
      username: params.username,
      email: params.email,
      role: params.role,
      isActive: true,
    });
  }

  if (params.departmentId) {
    await assignUserToDepartment(createdUser.id, params.departmentId);
  }

  return createdUser;
};

export const deleteUser = async (id: string) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await parseResponseBody(res);
    const message =
      body?.message || `${res.status} ${res.statusText}` || "Failed to delete user";
    throw new Error(message);
  }
};
