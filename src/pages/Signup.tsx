import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  confirmSignUpWithCognito,
  signUpWithCognito,
} from "../api/cognitoAuth";
import { API_BASE_URL } from "../api/baseUrl";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    const newErrors: { [key: string]: string } = {};

    if (!username.trim()) newErrors.username = "Full Name is required";
    if (!gender.trim()) newErrors.gender = "Gender is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!awaitingConfirmation && !password.trim()) {
      newErrors.password = "Password is required";
    }
    if (awaitingConfirmation && !confirmationCode.trim()) {
      newErrors.confirmationCode = "Verification code is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      if (awaitingConfirmation) {
        await confirmSignUpWithCognito(email.trim(), confirmationCode.trim());

        const profileResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            gender: gender.trim(),
          }),
        });

        const profileData = await profileResponse.json().catch(() => null);
        if (!profileResponse.ok) {
          throw new Error(profileData?.message || "Failed to create user profile");
        }

        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 500);
        return;
      }
      setMessage(`Signup successful! Redirecting to login...`);

      await signUpWithCognito({
        username: username.trim(),
        gender: gender.trim(),
        email: email.trim(),
        password,
      });

      setAwaitingConfirmation(true);
      setErrors({});
      setMessage(
        "Signup successful. Enter the verification code sent to your email."
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg) text-(--text) px-4">
      <div className="w-full max-w-md bg-(--surface) border border-(--border) shadow-(--shadow-strong) rounded-3xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent) text-white font-semibold shadow-(--shadow-soft)">
            RB
          </div>
          <h2 className="text-3xl font-semibold">Create your account</h2>
          <p className="text-sm text-(--text-muted)">
            {awaitingConfirmation
              ? "Verify your email to activate your account."
              : "Start managing teams and access in minutes."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={awaitingConfirmation}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.username
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={awaitingConfirmation}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) focus:ring-2 focus:outline-none transition ${
                errors.gender
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="unspecified">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={awaitingConfirmation}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={awaitingConfirmation}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {awaitingConfirmation && (
            <div>
              <input
                type="text"
                placeholder="Verification Code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                  errors.confirmationCode
                    ? "border-red-500 focus:ring-red-400"
                    : "border-(--border) focus:ring-(--accent-strong)"
                }`}
              />
              {errors.confirmationCode && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmationCode}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-(--accent) text-white font-semibold hover:bg-(--accent-strong) active:scale-95 transition duration-200"
          >
            {awaitingConfirmation ? "Verify Email" : "Sign Up"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.toLowerCase().includes("successful")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-(--text-muted)">
        <p className="mt-6 text-center text-sm text-(--text-muted)">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-(--accent) font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
