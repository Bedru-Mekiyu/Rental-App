// src/components/Navbar.jsx
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="nav-shell sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-400 shadow-lg">
            <span className="text-base font-bold text-white">RMS</span>
          </div>
          <div className="flex flex-col">
            <span className="app-title text-lg font-semibold text-slate-900">
              Rental Management
            </span>
            <span className="text-xs text-slate-500">
              Portfolio command center
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="pill bg-emerald-100 text-emerald-700">
              {user.role}
            </span>
            <div className="text-right">
              <div className="font-semibold text-slate-900">
                {user.fullName}
              </div>
              <div className="text-xs text-slate-500">
                {user.email}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-primary rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
