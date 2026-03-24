import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CognitoCodeDeliveryDetails,
  confirmForgotPassword,
  startForgotPassword,
} from "../api/cognitoAuth";

const formatDeliveryMessage = (details: CognitoCodeDeliveryDetails | null) => {
  if (!details?.destination) {
    return "Verification code sent. Enter it below with your new password.";
  }

  const medium = details.deliveryMedium?.toLowerCase() || "your email";
  return `Verification code sent via ${medium} to ${details.destination}. Enter it below with your new password.`;
};

export default function ForgetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setMessage("");

    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) newErrors.email = "Email is required";
    if (awaitingCode && !verificationCode.trim()) {
      newErrors.verificationCode = "Verification code is required";
    }
    if (awaitingCode && !newPassword.trim()) {
      newErrors.newPassword = "New Password is required";
    }
    if (awaitingCode && !confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }
    if (
      awaitingCode &&
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (!awaitingCode) {
        const result = await startForgotPassword(normalizedEmail);
        setAwaitingCode(true);
        setEmail(normalizedEmail);
        setMessage(formatDeliveryMessage(result.codeDeliveryDetails));
        return;
      }

      await confirmForgotPassword(
        normalizedEmail,
        verificationCode.trim(),
        newPassword
      );

      setMessage("Password updated successfully! Redirecting to login...");
      setEmail("");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/signin"), 500);
    } catch (err: any) {
      setErrors({
        apiError: err?.message || "Unable to reset password right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--text) px-4">
      <div className="bg-(--surface) border border-(--border) shadow-(--shadow-strong) rounded-3xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent) text-white font-semibold shadow-(--shadow-soft)">
            RB
          </div>
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <p className="text-sm text-(--text-muted)">
            {awaitingCode
              ? "Enter the verification code from your email and set a new password."
              : "Request a verification code to reset your password."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--text-muted)">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {awaitingCode && (
            <div>
              <label className="block text-sm font-medium text-(--text-muted)">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                  errors.verificationCode
                    ? "border-red-500 focus:ring-red-400"
                    : "border-(--border) focus:ring-(--accent-strong)"
                }`}
                placeholder="Enter verification code"
              />
              {errors.verificationCode && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.verificationCode}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-(--text-muted)">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!awaitingCode}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.newPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-muted)">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!awaitingCode}
              className={`mt-1 w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.apiError && (
            <p className="text-red-600 text-sm text-center">
              {errors.apiError}
            </p>
          )}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--accent) text-white py-3 rounded-xl hover:bg-(--accent-strong) transition disabled:opacity-50"
          >
            {loading
              ? awaitingCode
                ? "Updating..."
                : "Sending..."
              : awaitingCode
              ? "Update Password"
              : "Send Verification Code"}
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
