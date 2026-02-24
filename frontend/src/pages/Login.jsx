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
      className="page-transition relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-10"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/40" />
      <div className="pointer-events-none absolute inset-0 bg-primary-500/4" />
      <div className="mx-auto grid w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/55 shadow-lg backdrop-blur md:grid-cols-[1fr_1fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100/60 p-8 text-neutral-900">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1 bg-primary-500/50 md:block" />
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="relative space-y-4">
            <span className="pill bg-primary-600 text-white">Portfolio OS</span>
            <h1 className="app-title text-lg sm:text-xl font-semibold leading-tight">
              Rental Management System
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Track units, leases, and payments with a single, high-clarity dashboard.
            </p>
          </div>
          <div className="relative space-y-4 text-xs sm:text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              Real-time occupancy and payment insights
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              Role-based dashboards for each team
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              Unified audit trail and finance summaries
            </div>
          </div>
        </div>

        <div className="bg-white/90 p-6 sm:p-10">
          <div className="mb-5 space-y-2">
            <h2 className="app-title text-lg sm:text-xl font-semibold text-neutral-900">
              Welcome back
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500">
              Sign in to continue managing your portfolio.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input text-xs sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="form-input text-xs sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-5 py-2.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-white transition ${
                loading
                  ? "cursor-not-allowed bg-neutral-400"
                  : "btn-primary"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 text-[10px] sm:text-[11px] text-neutral-500">
            First time? Contact your administrator to create an account.
          </div>
        </div>
      </div>
    </div>
  );
}
