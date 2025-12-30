// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar - only show when logged in */}
        {user && <Sidebar />}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            user ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-6 pt-20">
            {" "}
            {/* pt-20 = space below fixed navbar (top-16 in Sidebar) */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
