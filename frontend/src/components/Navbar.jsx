// src/components/Navbar.jsx
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="glass flex h-16 items-center justify-between border-b border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <span className="text-lg font-bold text-white">RMS</span>
        </div>
        <div className="flex flex-col">
          <span className="gradient-text text-lg font-bold tracking-tight">
            Rental Management System
          </span>
          {user && (
            <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              {user.role}
            </span>
          )}
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="font-semibold text-slate-800">
              {user.fullName}
            </div>
            <div className="text-xs text-slate-600">
              {user.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
