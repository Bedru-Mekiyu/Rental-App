// src/components/Navbar.jsx
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="nav-shell fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600">
            <span className="text-base font-semibold text-white">RM</span>
          </div>
          <div className="flex flex-col">
            <span className="app-title text-md font-small text-slate-900">
              Rental Management
            </span>

          </div>
        </div>

        {user && (
          <div className="flex items-center md:gap-4 gap-1 text-sm">
            <span className="pill bg-primary-100 text-primary-700">
              {user.role}
            </span>
            <div className="hidden text-right sm:block">
              <div className="font-semibold text-slate-900">
                {user.fullName}
              </div>
              <div className="text-xs text-slate-500">
                {user.email}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
