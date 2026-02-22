// src/components/DashboardShell.jsx
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
            <header>
              <h1 className="text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              )}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
