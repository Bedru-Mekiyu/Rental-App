// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SkeletonRow from "./SkeletonRow";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="surface-panel w-full max-w-md p-6">
          <SkeletonRow className="h-4 w-32" />
          <div className="mt-4 space-y-3">
            <SkeletonRow className="h-5 w-full" />
            <SkeletonRow className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If children is provided, render it (pattern used above), otherwise Outlet
  return children || <Outlet />;
}
