// src/pages/GeneralManagerDashboard.jsx
import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GeneralManagerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalProperties: 250,
    activeLeases: 220,
    occupancyRate: 90.5,
  });

  const [revenueTrend, setRevenueTrend] = useState([]);
  const [occupancyByType, setOccupancyByType] = useState([]);

  const [revenueStats, setRevenueStats] = useState({
    currentMonth: 260000,
    monthToDate: 245000,
    avgPerUnit: 950,
  });

  const [occupancyStats, setOccupancyStats] = useState({
    vacantUnits: 24,
    turnoverRate: 15,
  });

  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        kpiRes,
        revenueRes,
        occupancyRes,
        reportsRes,
      ] = await Promise.all([
        API.get("/dashboard/kpis"),
        API.get("/dashboard/revenue-trend"),
        API.get("/dashboard/occupancy-by-type"),
        API.get("/reports"),
      ]);

      setKpis(kpiRes.data);
      setRevenueTrend(revenueRes.data);
      setOccupancyByType(occupancyRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          General Manager Dashboard
        </h1>
        <p className="text-xs text-slate-500">
          Welcome back, {user?.name || "General Manager"}
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Total Properties" value={kpis.totalProperties} />
        <KpiCard label="Active Leases" value={kpis.activeLeases} />
        <KpiCard label="Overall Occupancy" value={`${kpis.occupancyRate}%`} />
      </section>

      {/* Revenue Analytics */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Revenue Analytics
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Overview of monthly revenue performance and key financial indicators.
        </p>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs">
            <Stat label="Current Month Revenue" value={formatCurrency(revenueStats.currentMonth)} />
            <Stat label="Month-to-Date Revenue" value={formatCurrency(revenueStats.monthToDate)} />
            <Stat label="Avg Revenue per Unit" value={formatCurrency(revenueStats.avgPerUnit)} />
          </div>
        </div>
      </section>

      {/* Occupancy Analytics */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Occupancy Analytics
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Current occupancy rates across property categories.
        </p>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyByType}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#F472B6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs">
            <Stat label="System Occupancy" value={`${kpis.occupancyRate}%`} />
            <Stat label="Total Vacant Units" value={occupancyStats.vacantUnits} />
            <Stat label="Turnover Rate" value={`${occupancyStats.turnoverRate}%`} />
          </div>
        </div>
      </section>

      {/* Financial Reports */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Financial Reports
          </h2>
          <div className="flex gap-2">
            <button className="rounded-md bg-slate-100 px-3 py-1 text-xs">
              Export to PDF
            </button>
            <button className="rounded-md bg-slate-100 px-3 py-1 text-xs">
              Export to CSV
            </button>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead className="text-left text-slate-500">
            <tr>
              <th>Report ID</th>
              <th>Report Name</th>
              <th>Date Generated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.date}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* Reusable components */

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}
