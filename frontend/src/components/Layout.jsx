// src/components/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-80 w-80 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-50/40 blur-[120px]" />
      </div>

      <Navbar />
      <div className="relative flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="app-main flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pb-14 sm:pt-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="app-frame">
              <div key={location.pathname} className="page-transition">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
