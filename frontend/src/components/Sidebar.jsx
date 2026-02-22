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
    <aside className="glass hidden h-full w-64 border-r border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md md:block">
      <nav className="flex flex-col gap-2 p-4 text-sm">
        <div className="mb-4 px-3 py-2">
          <h2 className="gradient-text text-xs font-semibold uppercase tracking-wider">
            Navigation
          </h2>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:text-slate-900 hover:shadow-md hover:transform hover:scale-102",
              ].join(" ")
            }
          >
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="transition-all duration-300">{item.label}</span>
            {({ isActive }) => isActive && (
              <div className="absolute right-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
