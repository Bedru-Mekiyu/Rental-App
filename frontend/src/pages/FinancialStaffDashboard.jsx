import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Simple avatar with initials
const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
      {initials}
    </div>
  );
};

// Reusable KPI Card with optional trend arrow
const KpiCard = ({ label, value, trend, trendValue }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      {trend && (
        <div className="text-right">
          <div className={`flex items-center text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {trendValue}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last month</p>
        </div>
      )}
    </div>
  </div>
);

export default function FinancialStaffDashboard() {
  const [loading, setLoading] = useState(true);

  // Mock data matching the screenshot exactly (as of December 29, 2025)
  const stats = {
    totalRevenue: "654,800",
    pendingPayments: "7,250",
    overdueInvoices: 5,
    processedPayments: 210,
  };

  const verificationQueue = [
    {
      tenant: "Alice Johnson",
      amount: 1500,
      method: "Bank Transfer",
      supportInfo: "Ref: ABC123456789 - First National Bank",
    },
    {
      tenant: "Bob Williams",
      amount: 1200,
      method: "Check",
      supportInfo: "Check #1024",
    },
    {
      tenant: "Carol Davis",
      amount: 980,
      method: "Wire Transfer",
      supportInfo: "SWIFT: BOFAUS3N",
    },
  ];

  const paymentHistory = [
    {
      date: "2025-12-28",
      tenant: "John Doe",
      amount: 1500,
      method: "Credit Card",
      status: "Completed",
      invoice: "INV-2025-001",
    },
    {
      date: "2025-12-26",
      tenant: "Alice Johnson",
      amount: 1500,
      method: "Bank Transfer",
      status: "Completed",
      invoice: "INV-2025-002",
    },
    {
      date: "2025-12-24",
      tenant: "Bob Williams",
      amount: 1200,
      method: "PayPal",
      status: "Pending",
      invoice: "INV-2025-003",
    },
    {
      date: "2025-12-22",
      tenant: "Michael Brown",
      amount: 1100,
      method: "Credit Card",
      status: "Completed",
      invoice: "INV-2025-004",
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success("Dashboard loaded successfully");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">Financial Staff Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Total Revenue" value={`$${stats.totalRevenue}`} trend="up" trendValue="+12%" />
        <KpiCard label="Pending Payments" value={`$${stats.pendingPayments}`} trend="up" trendValue="+3%" />
        <KpiCard label="Overdue Invoices" value={stats.overdueInvoices} />
        <KpiCard label="Processed Payments" value={stats.processedPayments} />
      </div>

      {/* Generate New Invoice */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Generate New Invoice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
            <input type="text" defaultValue="Alice Johnson" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input type="text" defaultValue="INV-2025-001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input type="date" defaultValue="2025-01-01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" defaultValue="2025-01-15" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            defaultValue="Monthly rent for January, utilities, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Line Items (Amount - Description)</h3>
          <div className="space-y-2">
            <div className="flex gap-4 items-center">
              <input type="number" defaultValue={1500} className="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" defaultValue="Rent - 1 Bedroom Apartment" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex gap-4 items-center">
              <input type="number" defaultValue={75} className="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" defaultValue="Utilities" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
          Generate Invoice
        </button>
      </div>

      {/* Manual Payment Verification Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Manual Payment Verification Queue</h2>
        <div className="space-y-6">
          {verificationQueue.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
              <div className="flex items-center gap-4">
                <Avatar name={item.tenant} />
                <div>
                  <p className="font-semibold text-gray-900">Tenant: {item.tenant}</p>
                  <p className="text-sm text-gray-600">${item.amount} · {item.method}</p>
                  <p className="text-xs text-gray-500 mt-1">Support Info: {item.supportInfo}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Verify
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="pb-3">Date</th>
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Invoice ID</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">{p.date}</td>
                  <td className="py-3">{p.tenant}</td>
                  <td className="py-3">${p.amount}</td>
                  <td className="py-3">{p.method}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      p.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">{p.invoice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Reports & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Financial Reports</h2>
          <div className="space-y-4">
            {["Monthly Revenue Report", "Delinquency Report", "Expense Report"].map((report) => (
              <div key={report} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">{report}</span>
                </div>
                <Link to="#" className="text-indigo-600 text-sm font-medium hover:underline">
                  View Report →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Export Data</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to PDF
            </button>
            <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}