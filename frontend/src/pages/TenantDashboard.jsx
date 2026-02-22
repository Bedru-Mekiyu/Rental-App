// src/pages/TenantDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import API from "../services/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  Bell,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Download,
  Eye,
  Building,
  MapPin,
  Plus,
  X,
} from "lucide-react";

const maintenanceSchema = z.object({
  description: z
    .string()
    .min(5, "Please describe the issue in detail (at least 5 characters)"),
  urgency: z.enum(["low", "medium", "high"]),
});

export default function TenantDashboard() {
  const { user } = useAuthStore();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const paymentSchema = z.object({
    amountEtb: z.number().min(0.01, "Amount must be greater than 0"),
    paymentMethod: z.enum(["Bank Transfer", "Cash", "Check", "Mobile Money", "Other"]),
    transactionDate: z.string().min(1, "Transaction date is required"),
    externalTransactionId: z.string().optional(),
    notes: z.string().optional(),
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
    reset: resetPayment,
    setValue: setPaymentValue,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      leaseId: lease?._id || "",
      paymentMethod: "Bank Transfer",
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { urgency: "medium" },
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [leaseRes, paymentRes, maintenanceRes] = await Promise.allSettled([
        API.get(`/leases/by-tenant/${user._id}`).catch(() => ({ data: [] })),
        API.get(`/payments/by-tenant/${user._id}`).catch(() => ({ data: [] })),
        API.get(`/maintenance/by-tenant/${user._id}`).catch(() => ({ data: { data: [] } })),
      ]);

      setLease(leaseRes.status === 'fulfilled' ? leaseRes.value?.[0] || null : null);
      setPayments(paymentRes.status === 'fulfilled' ? paymentRes.value || [] : []);
      setRequests(maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data || [] : []);

      setDocuments([
        "Lease Agreement.pdf",
        "Property Rules and Regulations.pdf",
        "Move-In Checklist.pdf",
      ]);

      setNotifications([
        {
          message:
            "Your rent payment for next month is due soon.",
          date: "Today, 10:00 AM",
        },
        {
          message:
            "Maintenance request M001 is now in progress.",
          date: "2 days ago, 02:30 PM",
        },
      ]);
    } catch (err) {
      console.error("TenantDashboard loadData error", err);
      // Don't show error toast for now, just log it
      // The component will still render with empty data
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user?._id, loadData]); // loadData is memoized with useCallback

  // Set default lease when lease data loads
  useEffect(() => {
    if (lease?._id && setPaymentValue) {
      setPaymentValue("leaseId", lease._id);
    }
  }, [lease?._id, setPaymentValue]); // setPaymentValue is stable from react-hook-form

  const onPaymentSubmit = async (formData) => {
    console.log("Payment form submitted with data:", formData);
    if (!lease) {
      toast.error("Unable to record payment: No active lease found. Please contact your property manager.");
      return;
    }

    try {
      const payload = {
        ...formData,
        leaseId: lease._id,
        amountEtb: Number(formData.amountEtb),
      };
      console.log("Payment payload:", payload);

      const response = await API.post("/payments", payload);
      console.log("Payment API response:", response);
      toast.success("Payment recorded successfully! It will be verified by management.");
      setShowPaymentForm(false);
      resetPayment();
      loadData(); // Refresh payments list
    } catch (err) {
      console.error("TenantDashboard payment submit error", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to record payment"
      );
    }
  };

  const onMaintenanceSubmit = async (formData) => {
    console.log("Maintenance form submitted with data:", formData);
    if (!lease) {
      toast.error("Unable to submit maintenance request: No active lease found. Please contact your property manager.");
      return;
    }

    const unitId = typeof lease.unitId === 'object' ? lease.unitId?._id : lease.unitId;

    if (!unitId) {
      toast.error("Unable to submit maintenance request: Unit information is invalid. Please contact your property manager.");
      return;
    }

    try {
      const payload = {
        ...formData,
        unitId,
      };
      console.log("Maintenance payload:", payload);

      const response = await API.post("/maintenance", payload);
      console.log("Maintenance API response:", response);
      toast.success("Maintenance request submitted successfully!");
      loadData(); // Refresh requests list
    } catch (err) {
      console.error("TenantDashboard maintenance submit error", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to submit maintenance request"
      );
    }
  };

  // Don't render anything if user is not available
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-sm text-gray-500">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-enhanced mb-8 p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Tenant'}!
            </h1>
            <p className="text-indigo-100 text-lg">
              Manage your lease, payments, and maintenance requests all in one place.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {user?.fullName || user?.email}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-xl">
            <span className="text-3xl">🏠</span>
          </div>
        </div>
      </div>

      {/* Lease + payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lease summary */}
        <section className="lg:col-span-1 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover-lift fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <div className="rounded-lg bg-indigo-100 p-2">
              <Home className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              My Lease
            </h2>
          </div>
          {!lease ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No active lease found.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contact your property manager
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="font-medium text-gray-900">
                    {lease?.propertyId?.name || lease?.propertyName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-medium text-gray-900">
                    {lease?.unitId?.unitNumber || lease?.unitNumber || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Monthly Rent</p>
                  <p className="font-medium text-gray-900">
                    {lease.monthlyRentEtb
                      ? `${lease.monthlyRentEtb.toLocaleString()} ETB`
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Lease Period</p>
                  <p className="font-medium text-gray-900">
                    {lease.startDate
                      ? new Date(lease.startDate).toLocaleDateString()
                      : "—"} - {lease.endDate
                      ? new Date(lease.endDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center pt-2">
                <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  <CheckCircle className="h-3 w-3" />
                  <span>{lease.status || "ACTIVE"}</span>
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Payment history */}
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-emerald-100 p-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment History
                </h2>
                <p className="text-xs text-gray-500">
                  Track your rent payments and their status.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Payment</span>
              </button>
              <div className="rounded-full bg-amber-50 px-4 py-2 text-xs text-amber-700 border border-amber-200">
                💳 Upload receipt (coming soon)
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No payments recorded yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {p.transactionDate
                              ? new Date(p.transactionDate).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>
                            {p.amountEtb
                              ? `${p.amountEtb.toLocaleString()} ETB`
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {p.status === 'VERIFIED' && <CheckCircle className="h-3 w-3" />}
                          {p.status === 'PENDING' && <Clock className="h-3 w-3" />}
                          {p.status === 'REJECTED' && <AlertCircle className="h-3 w-3" />}
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {p.externalTransactionId || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Payment form */}
      {showPaymentForm && (
        <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-6">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Plus className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Record New Payment
            </h2>
          </div>

          <form onSubmit={handlePaymentSubmit(onPaymentSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="amountEtb"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Payment Amount (ETB)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="amountEtb"
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Enter amount"
                    {...registerPayment("amountEtb", {
                      valueAsNumber: true,
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be greater than 0" }
                    })}
                  />
                </div>
                {paymentErrors.amountEtb && (
                  <p className="mt-1 text-xs text-red-500">
                    {paymentErrors.amountEtb.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  {...registerPayment("paymentMethod", {
                    required: "Payment method is required"
                  })}
                >
                  <option value="">Select method</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Check">📝 Check</option>
                  <option value="Mobile Money">📱 Mobile Money</option>
                  <option value="Other">🔄 Other</option>
                </select>
                {paymentErrors.paymentMethod && (
                  <p className="mt-1 text-xs text-red-500">
                    {paymentErrors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="transactionDate"
                    type="date"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    {...registerPayment("transactionDate", {
                      required: "Transaction date is required"
                    })}
                  />
                </div>
                {paymentErrors.transactionDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {paymentErrors.transactionDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="externalTransactionId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Transaction ID (Optional)
                </label>
                <input
                  id="externalTransactionId"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Bank reference or receipt number"
                  {...registerPayment("externalTransactionId")}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                placeholder="Any additional notes about this payment..."
                {...registerPayment("notes")}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
              >
                <CreditCard className="h-4 w-4" />
                <span>Record Payment</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Maintenance + documents + notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Maintenance */}
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <Wrench className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Maintenance Requests
                </h2>
                <p className="text-xs text-gray-500">
                  Submit new requests and track their status.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onMaintenanceSubmit)}
            className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Describe the issue
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Example: The kitchen sink is leaking under the cabinet..."
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <label
                  htmlFor="urgency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Urgency Level
                </label>
                <select
                  id="urgency"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  {...register("urgency")}
                >
                  <option value="low">🟢 Low - Can wait</option>
                  <option value="medium">🟡 Medium - Soon</option>
                  <option value="high">🟠 High - Important</option>
                </select>
                {errors.urgency && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.urgency.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center space-x-2 rounded-lg bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>

          {/* Requests list */}
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No maintenance requests yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submit your first request above
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li
                  key={r._id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      {r.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>Unit {r?.unitId?.unitNumber || r?.unitNumber || "N/A"}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status?.toLowerCase().includes('completed') ? 'bg-emerald-100 text-emerald-800' :
                      r.status?.toLowerCase().includes('in_progress') || r.status?.toLowerCase().includes('progress') ? 'bg-blue-100 text-blue-800' :
                      r.status?.toLowerCase().includes('pending') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.status?.toLowerCase().includes('completed') && <CheckCircle className="h-3 w-3" />}
                      {r.status?.toLowerCase().includes('progress') && <Clock className="h-3 w-3" />}
                      <span>{r.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                    </span>
                    <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.urgency?.toLowerCase() === 'emergency' ? 'bg-red-100 text-red-800' :
                      r.urgency?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800' :
                      r.urgency?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <AlertCircle className="h-3 w-3" />
                      <span>{r.urgency || 'Low'}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Documents + notifications */}
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover-lift">
            <div className="flex items-center space-x-2 mb-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Documents
              </h2>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No documents available.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{doc}</span>
                    </div>
                    <button
                      className="inline-flex items-center space-x-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        toast.info(`Downloading ${doc}...`, {
                          description: 'Document download feature coming soon!'
                        });
                      }}
                    >
                      <Download className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover-lift">
            <div className="flex items-center space-x-2 mb-4">
              <div className="rounded-lg bg-purple-100 p-2">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No notifications yet.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see updates here
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm"
                  >
                    <div className="rounded-full bg-purple-100 p-1.5 mt-0.5">
                      <Bell className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {n.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
