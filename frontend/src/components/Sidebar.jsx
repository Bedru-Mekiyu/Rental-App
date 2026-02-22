// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const menuItems = {
  ADMIN: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/units", label: "Units", icon: "🏠" },
    { to: "/leases", label: "Leases", icon: "📄" },
    { to: "/payments", label: "Payments", icon: "💳" },
    { to: "/finance", label: "Finance", icon: "💰" },
    { to: "/users", label: "Users", icon: "👥" },
  ],
  PM: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/units", label: "Unit Management", icon: "🏠" },
    { to: "/leases", label: "Lease Management", icon: "📄" },
    { to: "/tenants", label: "Tenant Management", icon: "👥" },
    { to: "/payments", label: "Payments", icon: "💳" },
  ],
  FS: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/payments", label: "Payments", icon: "💳" },
    { to: "/finance", label: "Financial Summary", icon: "💰" },
  ],
  GM: [
    { to: "/dashboard", label: "Analytics Dashboard", icon: "📈" },
    { to: "/leases", label: "Leases", icon: "📄" },
    { to: "/units", label: "Units", icon: "🏠" },
  ],
  TENANT: [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/my-lease", label: "My Lease", icon: "🏠" },
    { to: "/payments", label: "Payment History", icon: "💳" },
  ],
};

export default function Sidebar() {
  const { user } = useAuthStore();
  const items = menuItems[user?.role] || [];

  if (items.length === 0) return null;

  return (
    <aside className="hidden w-64 shrink-0 px-5 pb-8 pt-6 md:block">
      <div className="surface-panel h-full px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="app-title text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Navigation
          </h2>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="transition-all duration-300">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
