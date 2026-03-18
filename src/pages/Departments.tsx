import { useEffect, useState } from "react";
import { Roles } from "../types/roles";
import {
  createDepartment as createDepartmentRequest,
  deleteDepartment as deleteDepartmentRequest,
  fetchDepartments as fetchDepartmentsRequest,
} from "../services/department.service";
import { Trash } from "lucide-react";

interface Department {
  id: string;
  name: string;
  manager?: User | null;
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: Roles[];
  isActive: boolean;
  department?: Department;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDepartments = async () => {
    try {
      const list = await fetchDepartmentsRequest();
      setDepartments(list);
      setError("");
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
      setError(error instanceof Error ? error.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async () => {
    if (!newDepartment.trim()) return;

    try {
      const dept = await createDepartmentRequest(newDepartment.trim());

      setDepartments((prev) => [...prev, dept]);
      setNewDepartment("");
    } catch (error) {
      console.error("Create department error:", error);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    try {
      await deleteDepartmentRequest(id);

      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex flex-col items-center" role="status" aria-live="polite">
          <div
            className="h-10 w-10 rounded-full border-4 border-(--border) border-t-(--accent) animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Loading departments</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>
        <p className="text-(--text-muted)">Manage company departments</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create Department */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-(--surface) p-4 shadow">
        <input
          type="text"
          placeholder="Department name..."
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
          className="border border-(--border) bg-(--surface) text-(--text) placeholder:text-(--text-muted) px-3 py-2 rounded-lg w-64"
        />

        <button
          onClick={createDepartment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed"
          disabled={newDepartment.trim() === ""}
        >
          + Add Department
        </button>
      </div>

      {/* Department Table */}
      <div className="overflow-x-auto rounded-lg bg-(--surface) shadow">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-(--surface-2)">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Department Name</th>
              <th className="p-3">Manager</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dept, index) => (
              <tr key={dept.id} className="border-t border-(--border) hover:bg-(--surface-2)">
                <td className="p-3">{index + 1}</td>

                <td className="p-3 font-medium">{dept.name}</td>

                <td className="p-3">{dept.manager?.username || "Unassigned"}</td>

                <td className="p-3">
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="inline-flex items-center gap-2 text-red-600 hover:underline"
                  >
                    <Trash size={14}/>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {departments.length === 0 && (
          <div className="text-center p-6 text-(--text-muted)">
            No departments found
          </div>
        )}
      </div>
    </div>
  );
}





