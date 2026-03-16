import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/baseUrl";

const BASE_URL = API_BASE_URL;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setMessage("");
    const newErrors: { [key: string]: string } = {};

    // Validate fields
    if (!username.trim()) newErrors.username = "Full Name is required";
    if (!gender.trim()) newErrors.gender = "Gender is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    // If there are errors, stop submission
    if (Object.keys(newErrors).length > 0) return;

    // Submit form
    const payload = { username, gender, email, password };

    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Signup failed");
        return;
      }
      setMessage(`Signup successful! Redirecting to login...`);

      setTimeout(() => {
        navigate("/signin");
      }, 500);
      setUsername("");
      setEmail("");
      setPassword("");
      setErrors({});
    } catch (err) {
      setMessage("Server error. Try again later.");
      console.error(err);
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
          <p className="text-sm text-(--text-muted)">Start managing teams and access in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.username ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) focus:ring-2 focus:outline-none transition ${
                errors.gender ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="unspecified">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.email ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:ring-2 focus:outline-none transition ${
                errors.password ? "border-red-500 focus:ring-red-400" : "border-(--border) focus:ring-(--accent-strong)"
              }`}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-(--accent) text-white font-semibold hover:bg-(--accent-strong) active:scale-95 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-medium ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-(--text-muted)">
          Already have an account?{" "}
          <Link to="/signin" className="text-(--accent) font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;






