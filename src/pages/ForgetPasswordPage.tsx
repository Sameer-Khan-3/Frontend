import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/baseUrl";

const BASE_URL = API_BASE_URL;

export default function ForgetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors and messages
    setErrors({});
    setMessage("");

    const newErrors: { [key: string]: string } = {};

    // Validation
    if (!email.trim()) newErrors.email = "Email is required";
    if (!newPassword.trim()) newErrors.newPassword = "New Password is required";
    if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm Password is required";
    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      setErrors({ apiError: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--text) px-4">
      <div className="bg-(--surface) border border-(--border) shadow-[var(--shadow-strong)] rounded-3xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent) text-white font-semibold shadow-[var(--shadow-soft)]">
            RB
          </div>
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <p className="text-sm text-(--text-muted)">Securely update your account password.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-(--text-muted)">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.email ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-muted)">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.newPassword ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Enter new password"
            />
            {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-muted)">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.apiError && <p className="text-red-600 text-sm text-center">{errors.apiError}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--accent) text-white py-3 rounded-xl hover:bg-(--accent-strong) transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--text-muted)">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-(--accent) font-medium cursor-pointer hover:underline"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}






