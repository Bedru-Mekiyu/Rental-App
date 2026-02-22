// src/pages/NewUserPage.jsx
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";

const ROLE_OPTIONS = ["ADMIN", "PM", "GM", "FS", "TENANT"];

export default function NewUserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Optional: allow ?role=TENANT to preselect from Tenant Management
  const initialRole = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");
    if (r && ROLE_OPTIONS.includes(r)) return r;
    return "TENANT";
  }, [location.search]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
  });

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.post("/users", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      }); // POST /api/users
      toast.success("User created");
      navigate("/users");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create user";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add New User
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new account and assign an appropriate role.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back to Users
        </button>
      </header>

      <DashboardCard title="User Details">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 text-sm"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={handleChange("fullName")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              placeholder="Alice Johnson"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              placeholder="alice@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              placeholder="+251..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              placeholder="Temporary password"
            />
          </div>

          <div className="space-y-1 md:max-w-xs">
            <label className="text-xs font-medium text-slate-600">
              Role
            </label>
            <select
              value={form.role}
              onChange={handleChange("role")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}
