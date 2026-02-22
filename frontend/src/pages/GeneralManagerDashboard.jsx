
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
import jsPDF from "jspdf";
import Papa from "papaparse";

export default function GeneralManagerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalProperties: 0,
    activeLeases: 0,
    occupancyRate: 0,
  });

  const [revenueTrend, setRevenueTrend] = useState([]);
  const [occupancyByType, setOccupancyByType] = useState([]);

  const [revenueStats, setRevenueStats] = useState({
    currentMonth: 0,
    monthToDate: 0,
    avgPerUnit: 0,
  });

  const [occupancyStats, setOccupancyStats] = useState({
    vacantUnits: 0,
    turnoverRate: 0,
  });

  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [unitsRes, leasesRes] = await Promise.all([
        API.get("/units"),
        API.get("/leases"),
      ]); // /api/units + /api/leases

      const units = unitsRes.data?.data || [];
      const leases = leasesRes.data || [];

      // Distinct properties from units
      const propertyIds = new Set(
        units
          .map((u) => String(u.propertyId || ""))
          .filter((id) => id && id !== "undefined")
      );
      const totalProperties = propertyIds.size;

      const totalUnits = units.length;
      const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
      const vacantUnits = units.filter((u) => u.status === "VACANT").length;
      const activeLeases = leases.filter((l) => l.status === "ACTIVE").length;

      const occupancyRate =
        totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Occupancy by unit type
      const typeMap = new Map();
      units.forEach((u) => {
        const t = u.type || "Unknown";
        if (!typeMap.has(t)) {
          typeMap.set(t, { type: t, total: 0, occupied: 0 });
        }
        const entry = typeMap.get(t);
        entry.total += 1;
        if (u.status === "OCCUPIED") entry.occupied += 1;
      });
      const occupancyByTypeData = Array.from(typeMap.values()).map((t) => ({
        type: t.type,
        occupancy:
          t.total > 0 ? Math.round((t.occupied / t.total) * 100) : 0,
      }));

      // Simple revenue trend & stats (placeholder using active leases)
      const estMonthlyRevenue = leases
        .filter((l) => l.status === "ACTIVE")
        .reduce((sum, l) => sum + (l.monthlyRentEtb || 0), 0);

      const revenueTrendData = [
        { month: "Jan", revenue: estMonthlyRevenue * 0.8 },
        { month: "Feb", revenue: estMonthlyRevenue * 0.9 },
        { month: "Mar", revenue: estMonthlyRevenue * 1.0 },
        { month: "Apr", revenue: estMonthlyRevenue * 1.05 },
        { month: "May", revenue: estMonthlyRevenue * 1.1 },
      ];

      const avgPerUnit =
        occupiedUnits > 0
          ? Math.round(estMonthlyRevenue / occupiedUnits)
          : 0;

      setKpis({
        totalProperties,
        activeLeases,
        occupancyRate: Number(occupancyRate.toFixed(1)),
      });

      setOccupancyStats({
        vacantUnits,
        turnoverRate: 0, // could be computed when you track move-outs
      });

      setRevenueStats({
        currentMonth: estMonthlyRevenue,
        monthToDate: estMonthlyRevenue * 0.9,
        avgPerUnit,
      });

      setOccupancyByType(occupancyByTypeData);
      setRevenueTrend(revenueTrendData);

      setReports([
        {
          id: "RPT-001",
          name: "Monthly Portfolio Overview",
          date: "This month",
          status: "Ready",
        },
        {
          id: "RPT-002",
          name: "Occupancy & Vacancy Report",
          date: "This month",
          status: "Ready",
        },
      ]);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(v || 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Financial Reports", 20, 20);
    reports.forEach((r, i) => {
      doc.text(`${r.id}: ${r.name} - ${r.status}`, 20, 40 + i * 10);
    });
    doc.save("reports.pdf");
  };

  const exportCSV = () => {
    const csv = Papa.unparse(reports);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "reports.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="card-enhanced mb-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">
              General Manager Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Welcome back, {user?.fullName || "General Manager"}. Here's your portfolio overview.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <span className="text-2xl">📊
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <KpiCard
          label="Total Properties"
          value={kpis.totalProperties}
          icon="🏢"
          gradient="from-blue-500 to-cyan-500"
        />
        <KpiCard
          label="Active Leases"
          value={kpis.activeLeases}
          icon="📄"
          gradient="from-green-500 to-emerald-500"
        />
        <KpiCard
          label="Overall Occupancy"
          value={`${kpis.occupancyRate}%`}
          icon="📊"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Revenue analytics */}
      <section className="card-enhanced p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
            <span className="text-lg">💰</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Revenue Analytics
            </h2>
            <p className="text-sm text-slate-600">
              Overview of monthly revenue performance and key financial indicators.
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} stroke="#64748b" />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100">
              <Stat
                label="Current Month Revenue"
                value={formatCurrency(revenueStats.currentMonth)}
                icon="📈"
              />
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border border-blue-100">
              <Stat
                label="Month-to-Date Revenue"
                value={formatCurrency(revenueStats.monthToDate)}
                icon="📊"
              />
            </div>
            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-100">
              <Stat
                label="Avg Revenue per Occupied Unit"
                value={formatCurrency(revenueStats.avgPerUnit)}
                icon="🏠"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Occupancy analytics */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">
          Occupancy Analytics
        </h2>
        <p className="mb-4 text-xs text-slate-500">
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
            <Stat
              label="Vacant Units"
              value={occupancyStats.vacantUnits}
            />
            <Stat
              label="Turnover Rate"
              value={`${occupancyStats.turnoverRate}%`}
            />
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Financial Reports
          </h2>
          <div className="flex gap-2">
            <button className="rounded-md bg-slate-100 px-3 py-1 text-xs" onClick={exportPDF}>
              Export to PDF
            </button>
            <button className="rounded-md bg-slate-100 px-3 py-1 text-xs" onClick={exportCSV}>
              Export to CSV
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Report ID</th>
                <th className="px-3 py-2">Report Name</th>
                <th className="px-3 py-2">Date Generated</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, icon, gradient }) {
  return (
    <div className={`card-enhanced p-6 fade-in hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
          <p className="text-4xl font-bold text-slate-900">
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
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
