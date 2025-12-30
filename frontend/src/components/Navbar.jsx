// src/components/Navbar.jsx
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-indigo-700">RMS</h1>
          <span className="text-sm text-gray-500">
            Rental Management System
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>

            <button
              onClick={logout}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
