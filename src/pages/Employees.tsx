import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api/baseUrl";
import {
  deleteUser as deleteUserRequest,
  fetchDepartments as fetchDepartmentsRequest,
  fetchUsers as fetchUsersRequest,
} from "../services/user.service";
import { useAuth } from "../context/AuthContext";
import { Edit, Trash } from "lucide-react";

interface Role {
  id?: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role?: Role | null;
  isActive: boolean;
  department?: Department;
  createdAt?: string;
}

type CreateForm = {
  username: string;
  email: string;
  departmentId: string;
};

export default function Employees() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [managerDepartmentId, setManagerDepartmentId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>({
    username: "",
    email: "",
    departmentId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const { role } = useAuth();

  const BASE_URL = API_BASE_URL;
  const normalizeUser = (user: any): User => {
    const roleValue = user.role ?? user.roles?.[0] ?? null;
    const role =
      typeof roleValue === "string" ? { name: roleValue } : roleValue;

    return {
      ...user,
      role: role ?? null,
    };
  };

  const fetchUsers = async () => {
    try {
      const usersList = await fetchUsersRequest(role, debouncedSearch);
      setUsers(usersList.map(normalizeUser));
      setFetchError("");
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
      setFetchError(error instanceof Error ? error.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentList = await fetchDepartmentsRequest(role);
      setDepartments(departmentList);
      setDepartmentError("");
    } catch (err) {
      console.error("Failed to load departments", err);
      setDepartments([]);
      setDepartmentError(
        err instanceof Error ? err.message : "Failed to load departments"
      );
    }
  };

  const fetchManagerDepartment = async () => {
    if (role !== "Manager") {
      setManagerDepartmentId(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setManagerDepartmentId(null);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload?.id;
      if (!userId) {
        setManagerDepartmentId(null);
        return;
      }

      const res = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setManagerDepartmentId(null);
        return;
      }

      const data = await res.json();
      setManagerDepartmentId(data?.department?.id ?? null);
    } catch (error) {
      console.error("Fetch manager department error:", error);
      setManagerDepartmentId(null);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteUserRequest(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.username.trim() || !createForm.email.trim()) {
      alert("Name and email are required");
      return;
    }
    if (role === "Manager" && !managerDepartmentId) {
      alert("You must be assigned to a department before creating users.");
      return;
    }
    try {
      setCreating(true);
      const token = localStorage.getItem("token");

      const createDepartmentId =
        role === "Manager" ? managerDepartmentId : createForm.departmentId;

      const createRes = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: createForm.username.trim(),
          email: createForm.email.trim(),
          password: "Temp@123456",
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create user");
      }

      const createdUser = await createRes.json();

      if (createDepartmentId) {
        await fetch(`${BASE_URL}/departments/assign-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: createdUser.id,
            departmentId: createDepartmentId,
          }),
        });
      }

      setCreateForm({
        username: "",
        email: "",
        departmentId: "",
      });
      setShowCreateCard(false);
      fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);
      alert("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role?.name || "Employee",
          isActive: editingUser.isActive,
          departmentId: editingUser.department?.id ?? null,
        }),
      });

      await res.json();

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          role: user.role?.name || "Employee",
          isActive: !user.isActive,
          departmentId: user.department?.id ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchUsers();
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, debouncedSearch]);

  useEffect(() => {
    fetchDepartments();
    fetchManagerDepartment();
  }, [role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, sortBy]);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = `${user.username} ${user.email} ${user.role?.name}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchesRole =
        roleFilter === "" || user.role?.name === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const getCreatedAt = (value?: string) =>
        value ? new Date(value).getTime() : 0;

      if (sortBy === "name") {
        return a.username.localeCompare(b.username);
      }

      if (sortBy === "role") {
        return (a.role?.name || "").localeCompare(
          b.role?.name || ""
        );
      }

      if (sortBy === "status") {
        return Number(b.isActive) - Number(a.isActive);
      }

      return getCreatedAt(b.createdAt) - getCreatedAt(a.createdAt);
    });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  const getVisiblePages = () => {
    const maxButtons = 5;
    const pages: number[] = [];
    const clampedCurrent = Math.min(Math.max(currentPage, 1), totalPages);

    if (totalPages <= maxButtons) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    let start = Math.max(1, clampedCurrent - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center" role="status" aria-live="polite">
          <div
            className="h-10 w-10 rounded-full border-4 border-(--border) border-t-(--accent) animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Loading users</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {role === "Admin" && "User Management"}
          {role === "Manager" && "Department Employees"}
          {role === "Employee" && "My Department"}
        </h1>

        {(role === "Admin" || role === "Manager") && (
          <button
            className="bg-blue-600 text-white px-2 py-2 rounded-lg"
            onClick={() => setShowCreateCard((prev) => !prev)}
          >
            {showCreateCard ? "Close" : "Create User"}
          </button>
        )}
      </div>

      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}
      {departmentError && role === "Admin" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {departmentError}
        </div>
      )}

      {(role === "Admin" || role === "Manager") && showCreateCard && (
        <div className="bg-(--surface) p-3 rounded-lg shadow space-y-2">
          <h2 className="text-lg font-semibold">Create User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-(--text-muted)">Name</label>
              <input
                className="w-full border border-(--border) bg-(--surface) text-(--text) placeholder:text-(--text-muted) p-2 rounded mt-1"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="text-sm text-(--text-muted)">Email</label>
              <input
                type="email"
                className="w-full border border-(--border) bg-(--surface) text-(--text) placeholder:text-(--text-muted) p-2 rounded mt-1"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>

            {role === "Admin" && (
              <div>
                <label className="text-sm text-(--text-muted)">
                  Department
                </label>
                <select
                  className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded mt-1"
                  value={createForm.departmentId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      departmentId: e.target.value,
                    })
                  }
                  disabled={departments.length === 0}
                >
                  <option value="">
                    {departments.length === 0
                      ? "No departments available"
                      : "Select Department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {role === "Manager" && (
              <div className="text-sm text-(--text-muted)">
                New users will be assigned to your department.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
              onClick={handleCreateUser}
              disabled={creating}
            >
              {creating ? "Creating..." : "Save User"}
            </button>
          </div>
        </div>
      )}


      <div className="bg-(--surface) p-3 rounded-lg shadow flex gap-4">
        <input
          type="text" placeholder="Search users..."
          className="border border-(--border) bg-(--surface) text-(--text) placeholder:text-(--text-muted) px-3 py-2 rounded-lg w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}/>

        {role === "Admin" && (
          <select
            className="border border-(--border) bg-(--surface) text-(--text) px-3 py-2 rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
        )}

        <select
          className="border border-(--border) bg-(--surface) text-(--text) px-3 py-2 rounded-lg"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="role">Role</option>
          <option value="status">Status</option>
        </select>
      </div>

      
      <div className="bg-(--surface) rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-(--surface-2)">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              {role === "Admin" && <th className="p-3">Actions</th>}
              {role === "Manager" && <th className="p-3">Actions</th>}
              {role === "Admin" && <th className="p-3">Department</th>}
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={user.id} className="border-t border-(--border) hover:bg-(--surface-2)">
                <td className="p-3">{startIndex + index + 1}</td>

                <td className="p-3">{user.username}</td>

                <td className="p-3">{user.email}</td>

                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                    {user.role?.name || "Employee"}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {role === "Admin" && (
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 cursor-pointer"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => setPendingDeleteUser(user)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 cursor-pointer"
                      >
                        <Trash size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                )}
                {role === "Manager" && (
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className="text-indigo-600 hover:underline"
                    >
                      {user.isActive ? "Set Inactive" : "Set Active"}
                    </button>
                  </td>
                )}
                {role === "Admin" && (
                  <td className="p-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm">
                      {user.department?.name || "Not Assigned"}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-sm text-(--text-muted)"
                  colSpan={role === "Admin" ? 7 : 6}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-(--text-muted)">
          Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + usersPerPage, filteredUsers.length)} of{" "}
          {filteredUsers.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border border-(--border) bg-(--surface) text-(--text) text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {getVisiblePages().map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded border border-(--border) text-sm ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-(--surface) text-(--text)"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="px-3 py-1 rounded border border-(--border) bg-(--surface) text-(--text) text-sm disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center">
          <div className="bg-(--surface) p-6 rounded-lg shadow w-96 space-y-4 cursor-pointer">
            <h2 className="text-lg font-semibold">Edit User</h2>

            <input
              className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
            />

            <input
              className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <select
              className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded"
              value={editingUser.role?.name}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: { name: e.target.value },
                })
              }
            >
              <option>Manager</option>
              <option>Employee</option>
            </select>

            <select
              className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded"
              value={editingUser.department?.id || ""}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  department: e.target.value
                    ? {
                        id: (e.target.value),
                        name:
                          departments.find(
                            (dept) => dept.id === (e.target.value)
                          )?.name || "",
                      }
                    : undefined,
                })
              }
            >
              <option value="">Select Department</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              className="w-full border border-(--border) bg-(--surface) text-(--text) p-2 rounded"
              value={editingUser.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  isActive: e.target.value === "active",
                })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)}>Cancel</button>

              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-(--surface) p-6 shadow-(--shadow-strong)">
            <h3 className="text-lg font-semibold">Delete user?</h3>
            <p className="mt-2 text-sm text-(--text-muted)">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-(--text)">
                {pendingDeleteUser.username}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-(--border) px-4 py-2 text-sm font-semibold text-(--text)"
                onClick={() => setPendingDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={async () => {
                  await deleteUser(pendingDeleteUser.id);
                  setPendingDeleteUser(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


