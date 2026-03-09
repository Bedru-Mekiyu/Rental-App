// src/pages/Login.jsx
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loginBg from "../assets/Screenshot.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(form.email, form.password);

    setLoading(false);

    if (result.success) {
      toast.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } else {
      setError(result.message || "Invalid email or password");
      toast.error(result.message || "Login failed");
    }
  };

  return (
    <div
      className="page-transition relative flex min-h-screen items-center justify-center bg-slate-100 px-3 py-6 sm:px-4 sm:py-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-white/40" />
      <div className="pointer-events-none absolute inset-0 bg-primary-500/4" />
      <div className="mx-auto grid w-[90vw] max-w-xs grid-cols-1 overflow-hidden rounded-xl bg-slate-900/55 shadow-lg backdrop-blur sm:w-full sm:max-w-md sm:rounded-2xl md:max-w-2xl md:grid-cols-[1fr_1fr]">
        <div
          className="login-showcase relative flex flex-col justify-between overflow-hidden bg-white p-0 text-neutral-900"
          style={{ "--login-bg": `url(${loginBg})` }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1 bg-primary-500/50 md:block" />
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="relative z-10 px-4 pt-2 sm:px-8 sm:pt-4 md:px-10 md:pt-6">
         
          </div>
        </div>

        <div className="bg-white/90 p-4 sm:p-8 md:p-10">
          <div className="mb-4 space-y-1.5 sm:mb-5 sm:space-y-2">
            <h2 className="app-title text-base sm:text-lg md:text-xl font-semibold text-neutral-900">
              Welcome back
            </h2>
            <p className="text-[10px] sm:text-xs text-neutral-500">
              Sign in to continue managing your portfolio.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input text-[11px] sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="form-input text-[11px] sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-2 text-[10px] sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-xs font-semibold uppercase tracking-wide text-white transition ${
                loading
                  ? "cursor-not-allowed bg-neutral-400"
                  : "btn-primary"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-[10px] sm:mt-5 sm:text-[11px] text-neutral-500">
            First time? Contact your administrator to create an account.
          </div>
        </div>
      </div>
    </div>
  );
}
