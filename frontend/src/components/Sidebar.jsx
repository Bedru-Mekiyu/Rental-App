// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const menuItems = {
  ADMIN: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/units", label: "Units" },
    { to: "/leases", label: "Leases" },
    { to: "/payments", label: "Payments" },
    { to: "/finance", label: "Finance" },
    { to: "/users", label: "Users" },
  ],
  PM: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/units", label: "Unit Management" },
    { to: "/leases", label: "Lease Management" },
    { to: "/tenants", label: "Tenant Management" },
    { to: "/payments", label: "Payments" },
  ],
  FS: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/payments", label: "Payments" },
    { to: "/finance", label: "Financial Summary" },
  ],
  GM: [
    { to: "/dashboard", label: "Analytics Dashboard" },
    { to: "/leases", label: "Leases" },
    { to: "/units", label: "Units" },
  ],
  TENANT: [
    { to: "/my-lease", label: "My Lease" },
    { to: "/payments", label: "Payment History" },
  ],
};

export default function Sidebar() {
  const { user } = useAuthStore();

  const items = menuItems[user?.role] || [];

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 bg-indigo-700 text-white h-screen fixed left-0 top-16 overflow-y-auto pt-6 z-20">
      <nav className="px-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `block px-5 py-3 rounded-lg transition duration-200 font-medium ${
                    isActive ? "bg-indigo-800 shadow-lg" : "hover:bg-indigo-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
