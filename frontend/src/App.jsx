// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import PropertyManagerDashboard from "./pages/PropertyManagerDashboard";
import GeneralManagerDashboard from "./pages/GeneralManagerDashboard";
import FinancialStaffDashboard from "./pages/FinancialStaffDashboard";
import TenantDashboard from "./pages/TenantDashboard";

import UnitsPage from "./pages/UnitsPage";
import LeasesPage from "./pages/LeasesPage";
import PaymentsPage from "./pages/PaymentsPage";
import FinancePage from "./pages/FinancePage";

import NewLeasePage from "./pages/NewLeasePage";
import UsersPage from "./pages/UsersPage";
import NewUserPage from "./pages/NewUserPage";
import UnitDetailPage from "./pages/UnitDetailPage";
import LeaseDetailPage from "./pages/LeaseDetailPage";
import TenantsPage from "./pages/TenantsPage";
import MyLeasePage from "./pages/MyLeasePage";

function App() {
  //    <Routes>
  // <Route path="/dashboard" element={<Dashboard />} />
  // <Route path="/payments" element={<Payments />} />
  // <Route path="/maintenance" element={<Maintenance />} />
  // </Routes>)

  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <>
    <Toaster />
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected app shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Index route - redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Role-based dashboard */}
        <Route
          path="dashboard"
          element={
            user?.role === "ADMIN" ? (
              // You can swap this to a dedicated Admin dashboard if you add one
              <PropertyManagerDashboard />
            ) : user?.role === "PM" ? (
              <PropertyManagerDashboard />
            ) : user?.role === "GM" ? (
              <GeneralManagerDashboard />
            ) : user?.role === "FS" ? (
              <FinancialStaffDashboard />
            ) : user?.role === "TENANT" ? (
              <TenantDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Common pages */}
        <Route path="units" element={<UnitsPage />} />
        <Route path="units/:id" element={<UnitDetailPage />} />

        <Route path="leases" element={<LeasesPage />} />
        <Route path="leases/new" element={<NewLeasePage />} />
        <Route path="leases/:id" element={<LeaseDetailPage />} />

        <Route path="payments" element={<PaymentsPage />} />
        <Route path="finance" element={<FinancePage />} />

        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<NewUserPage />} />

        {/* My Lease - TENANT only */}
        <Route
          path="my-lease"
          element={
            user?.role === "TENANT" ? (
              <MyLeasePage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Tenant management – ADMIN and PM only */}
        <Route
          path="tenants"
          element={
            user?.role === "ADMIN" || user?.role === "PM" ? (
              <TenantsPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
    </>
  );
}

export default App;
