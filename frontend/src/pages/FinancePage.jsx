// src/pages/FinancePage.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export default function FinancePage() {
  const [leases, setLeases] = useState([]);
  const [selectedLeaseId, setSelectedLeaseId] = useState("ALL");
  const [summary, setSummary] = useState(null);
  const [loadingLeases, setLoadingLeases] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    loadLeases();
  }, []);

  useEffect(() => {
    loadSummary(selectedLeaseId);
  }, [selectedLeaseId]);

  const loadLeases = async () => {
    try {
      setLoadingLeases(true);
      const res = await API.get("/leases"); // list all leases for selector
      setLeases(res.data || []);
    } catch {
      toast.error("Failed to load leases for finance summary");
    } finally {
      setLoadingLeases(false);
    }
  };

  const loadSummary = async (leaseId) => {
    if (leaseId === "ALL") {
      try {
        setLoadingSummary(true);
        const res = await API.get("/finance/portfolio/summary");
        setSummary(res.data);
      } catch {
        toast.error("Failed to load portfolio summary");
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    } else {
      try {
        setLoadingSummary(true);
        const res = await API.get(`/finance/lease/${leaseId}/summary`);
        setSummary(res.data);
      } catch (err) {
        const msg =
          err.response?.status === 404
            ? "Lease not found for summary"
            : "Failed to load financial summary";
        toast.error(msg);
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(v || 0);

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Finance &amp; Lease Analytics
        </h1>
        <p className="mt-2 text-indigo-100">
          View financial KPIs and per-lease payment summaries.
        </p>
      </header>

      {/* Financial Summary */}
      <DashboardCard
        title="Financial Summary"
        description="Select a lease to see its financial summary, or view aggregate for all leases."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Lease
            </label>
            <select
              value={selectedLeaseId}
              onChange={(e) => setSelectedLeaseId(e.target.value)}
              disabled={loadingLeases || leases.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition-all"
            >
              <option value="ALL">
                {loadingLeases ? "Loading leases..." : "All Leases (Aggregate)"}
              </option>
              {leases.map((lease) => (
                <option key={lease._id} value={lease._id}>
                  {lease.unitId?.unitNumber || "Unit"} ·{" "}
                  {lease.tenantId?.fullName || "Tenant"} ·{" "}
                  {lease.status}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Choose a lease to fetch its financial summary from the backend
            service. Aggregate shows portfolio-level data for all leases.
          </div>
        </div>

        {loadingSummary && (
          <p className="text-xs text-slate-500">
            Loading financial summary...
          </p>
        )}

        {!loadingSummary && summary && selectedLeaseId === "ALL" && (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Revenue (YTD)</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatCurrency(summary.totalRevenueYTD)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {formatCurrency(summary.outstandingBalance)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">On-time Payment Rate</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {summary.onTimePaymentRate}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {!loadingSummary && summary && selectedLeaseId !== "ALL" && (
          <>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Billed', amount: summary.totalBilledEtb },
                  { name: 'Paid', amount: summary.totalPaidEtb },
                  { name: 'Outstanding', amount: summary.outstandingBalanceEtb },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-500">Total Billed</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(summary.totalBilledEtb)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600">Total Paid</p>
                    <p className="text-lg font-semibold text-green-900">
                      {formatCurrency(summary.totalPaidEtb)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-xs text-red-600">Outstanding Balance</p>
                    <p className="text-lg font-semibold text-red-900">
                      {formatCurrency(summary.outstandingBalanceEtb)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600">Next Due Date</p>
                    <p className="text-sm font-medium text-blue-900">
                      {summary.nextDueDate
                        ? new Date(summary.nextDueDate).toLocaleDateString()
                        : "No upcoming due date"}
                    </p>
                    {summary.daysOverdue > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        {summary.daysOverdue} days overdue
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loadingSummary && !summary && selectedLeaseId !== "ALL" && (
          <p className="mt-2 text-xs text-slate-500">
            No financial summary available for this lease.
          </p>
        )}
      </DashboardCard>
    </div>
  );
}
