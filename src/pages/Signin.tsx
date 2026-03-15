import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";


const Signin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage('');
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const data = await login({ email, password });
      signIn({ token: data.token, user: data.user });

      navigate("/dashboard");

    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to fetch. Check API URL, backend status, and CORS."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--bg) text-(--text) px-4">
      <div className="w-full max-w-md p-8 bg-(--surface) rounded-3xl border border-(--border) shadow-[var(--shadow-strong)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent) text-white font-semibold shadow-[var(--shadow-soft)]">
            RB
          </div>
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-(--text-muted)">Sign in to your RBAC Studio workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.email ? 'border-red-500 focus:ring-red-400' : 'border-(--border) focus:ring-(--accent-strong)'
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
              className={`w-full px-4 py-3 border rounded-xl bg-(--surface) text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 transition ${
                errors.password ? 'border-red-500 focus:ring-red-400' : 'border-(--border) focus:ring-(--accent-strong)'
              }`}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <button type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold bg-(--accent) rounded-xl hover:bg-(--accent-strong) transition duration-200 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {errorMessage && (
            <p className="text-sm text-center text-red-500 mt-2">{errorMessage}</p>
          )}
          <p className="text-sm text-center mt-2 text-(--text-muted)">
            <span
            onClick={() =>navigate("/signup")}
            className="text-(--accent) cursor-pointer hover:underline">
            Don't have an account?{' '}
            </span>
          </p>
          <p className="text-sm text-right mt-2 text-(--text-muted)">
            <span
              onClick={() => navigate("/forget-password")}
              className="text-(--accent) cursor-pointer hover:underline">
              Forgot Password?
            </span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Signin;






