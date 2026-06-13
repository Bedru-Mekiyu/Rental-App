import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import GeneralManagerDashboard from "./pages/GeneralManagerDashboard";
import PropertyManagerDashboard from "./pages/PropertyManagerDashboard";
import FinancialStaffDashboard from "./pages/FinancialStaffDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import LeasesPage from "./pages/LeasesPage";
import LeaseDetailPage from "./pages/LeaseDetailPage";
import NewLeasePage from "./pages/NewLeasePage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentDetailPage from "./pages/PaymentDetailPage";
import FinancePage from "./pages/FinancePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import UnitsPage from "./pages/UnitsPage";
import UnitDetailPage from "./pages/UnitDetailPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import NewUserPage from "./pages/NewUserPage";
import TenantsPage from "./pages/TenantsPage";
import MaintenancePage from "./pages/MaintenancePage";
import SettingsPage from "./pages/SettingsPage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import DisputesPage from "./pages/DisputesPage";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user } = useAuthStore();
  
  switch (user?.role) {
    case 'GM':
      return <GeneralManagerDashboard />;
    case 'PM':
      return <PropertyManagerDashboard />;
    case 'FS':
      return <FinancialStaffDashboard />;
    case 'TENANT':
      return <TenantDashboard />;
    case 'ADMIN':
    default:
      return <GeneralManagerDashboard />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          duration: 4000,
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/" element={<Index />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/units/:unitId" element={<UnitDetailPage />} />
            <Route path="/leases" element={<LeasesPage />} />
            <Route path="/leases/new" element={<NewLeasePage />} />
            <Route path="/leases/:leaseId" element={<LeaseDetailPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/:paymentId" element={<PaymentDetailPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<NewUserPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-lease" element={<LeaseDetailPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
