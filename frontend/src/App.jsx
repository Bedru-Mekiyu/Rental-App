// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Layout & Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
// import Login from "./pages/Login";
import PropertyManagerDashboard from "./pages/PropertyManagerDashboard";
import GeneralManagerDashboard from "./pages/GeneralManagerDashboard";
import FinancialStaffDashboard from "./pages/FinancialStaffDashboard";
import AdminUserManagement from "./pages/AdminUserManagment";
import TenantDashboard from "./pages/TenantDashboard";
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import Maintenance from "./pages/Maintenance";
// import UnitsPage from "./pages/UnitsPage";

import UnitsPage from "./pages/UnitsPage";
import CreateLease from "./pages/CreateLease"


function App() {
//    <Routes>
// <Route path="/dashboard" element={<Dashboard />} />
// <Route path="/payments" element={<Payments />} />
// <Route path="/maintenance" element={<Maintenance />} />
// </Routes>)

  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-8 text-lg text-gray-600">Loading RMS...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={getDefaultRoute(user.role)} replace />}
        
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Role-Based Dashboard */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />

        {/* Functional Pages */}
        {/* <Route path="/units" element={<UnitsPage />} /> */}
        <Route path="/my-lease" element={<TenantDashboard />} />
        <Route path="/finance" element={<FinancialStaffDashboard />} />

        {/* Future Pages (Safe Fallbacks) */}
        <Route path="/leases" element={<ComingSoonPage title="Lease Management" />} />
        <Route path="/payments" element={<ComingSoonPage title="Payments Overview" />} />

        {/* Root Redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? getDefaultRoute(user.role) : "/login"} replace />}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Helper: Default route per role
function getDefaultRoute(role) {
  switch (role) {
    case "ADMIN":
    case "PM":
      return "/dashboard"; // PropertyManagerDashboard
    case "GM":
      return "/dashboard"; // GeneralManagerDashboard
    case "FS":
      return "/finance";
    case "TENANT":
      return "/my-lease";
    default:
      return "/dashboard";
  }
}

// Role-Based Dashboard Switch
function RoleBasedDashboard() {
  const { user } = useAuthStore();

  switch (user?.role) {
    case "ADMIN":
    case "PM":
      return <PropertyManagerDashboard />;
    case "GM":
      return <GeneralManagerDashboard />;
    case "FS":
      return <FinancialStaffDashboard />;
    case "TENANT":
      return <TenantDashboard />;
    default:
      return <PropertyManagerDashboard />;
  }
}

// Placeholder for upcoming pages
function ComingSoonPage({ title }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-2xl p-16 text-center">
        <p className="text-2xl text-indigo-700 font-medium">Page under development</p>
        <p className="text-lg text-gray-600 mt-4">Coming soon — stay tuned!</p>
      </div>
    </div>
  );
}

export default App;