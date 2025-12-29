import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from 'react-hot-toast';

// Avatar fallback component (simple initials circle)
const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
};

export default function PropertyManagerDashboard() {
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  // Hardcoded mock data - works 100% without any backend or API
  const units = [
    {
      _id: "1",
      address: "123 Main St, Apt 101",
      unitNumber: "101",
      bedrooms: 2,
      bathrooms: 1,
      areaSqFt: 950,
      status: "Occupied",
      monthlyRent: 1900,
    },
    {
      _id: "2",
      address: "456 Oak Ave, Unit 5",
      unitNumber: "5",
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: 1100,
      status: "Available",
      monthlyRent: 2200,
    },
    {
      _id: "3",
      address: "789 Pine Ln, Studio",
      unitNumber: "Studio",
      bedrooms: 1,
      bathrooms: 1,
      areaSqFt: 500,
      status: "Under Maintenance",
      monthlyRent: 1200,
    },
    {
      _id: "4",
      address: "101 Elm Dr, Penthouse",
      unitNumber: "Penthouse",
      bedrooms: 4,
      bathrooms: 3,
      areaSqFt: 2500,
      status: "Occupied",
      monthlyRent: 3500,
    },
  ];

  const activeTenants = [
    { _id: "t1", fullName: "Alice Smith" },
    { _id: "t2", fullName: "Bob Johnson" },
    { _id: "t3", fullName: "Charlie Brown" },
  ];

  const notifications = [
    {
      _id: "n1",
      title: "New maintenance request for Unit 105",
      message: "Tenant reported leaking faucet.",
    },
    {
      _id: "n2",
      title: "Lease renewal pending for Unit 8",
      message: "Tenant B. Tenant contract expires in 30 days.",
    },
    {
      _id: "n3",
      title: "Payment received from Alice Smith",
      message: "February rent paid in full.",
    },
  ];

  useEffect(() => {
    // Simulate loading delay for realism
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success("Dashboard loaded successfully");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      (unit.address?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (unit.unitNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "All" ||
      unit.status.toLowerCase() === filterStatus.toLowerCase().replace(" ", "");

    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    occupied: "bg-green-100 text-green-800",
    available: "bg-blue-100 text-blue-800",
    "under maintenance": "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.fullName || "Sarah Davis"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Overview of your property management operations.
        </p>
      </div>

      {/* Top Section: Units + Lease Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unit Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Unit Management</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {["All", "Available", "Occupied", "Under Maintenance"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filterStatus === status
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                </div>
              ) : filteredUnits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No units found</p>
              ) : (
                filteredUnits.map((unit) => (
                  <div
                    key={unit._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Photo
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {unit.address}
                          {unit.unitNumber && `, Unit ${unit.unitNumber}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {unit.bedrooms} Beds • {unit.bathrooms} Baths •{" "}
                          {unit.areaSqFt} sqft
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          statusColors[unit.status.toLowerCase()] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {unit.status}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ${unit.monthlyRent} / month
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lease Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Lease Management</h2>
            <div className="space-y-3">
              <Link
                to="/leases/create"
                className="w-full block text-center bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Create New Lease
              </Link>
              <Link
                to="/leases"
                className="w-full block text-center bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                View All Leases
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rent Calculation Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rent Calculation Preview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Rent (B)</span>
              <span className="font-medium">$1,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Market Adjustment (+5%)</span>
              <span className="font-medium">$75</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between pt-2">
              <span className="text-gray-900 font-semibold">Estimated Rent:</span>
              <span className="text-2xl font-bold text-purple-600">$1,575.00</span>
            </div>
          </div>
        </div>

        {/* Maintenance Summary (highlighted) */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-purple-500 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Maintenance Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Open Requests:</span>
              <span className="font-bold text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-bold text-gray-900">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resolved This Month:</span>
              <span className="font-bold text-gray-900">15</span>
            </div>
            <Link
              to="/maintenance"
              className="mt-4 block text-center bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
            >
              View All Requests
            </Link>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tenants</h3>
          <div className="space-y-4">
            {activeTenants.map((tenant) => (
              <div key={tenant._id} className="flex items-center gap-3">
                <Avatar name={tenant.fullName} />
                <p className="font-medium text-gray-900">{tenant.fullName}</p>
              </div>
            ))}
            <Link
              to="/tenants"
              className="block text-center text-indigo-600 text-sm font-medium hover:underline mt-4"
            >
              View All Tenants →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notifications Center */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications Center
          </h3>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif._id} className="text-sm">
                <p className="text-gray-800 font-medium">{notif.title}</p>
                <p className="text-gray-600">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Rules</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure dynamic pricing rules, seasonal adjustments, and market-based
            recommendations for your properties.
          </p>
          <Link
            to="/pricing-rules"
            className="block text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Configure Pricing Rules
          </Link>
        </div>

        {/* Operational Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Operational Reports
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link to="/reports/occupancy" className="text-indigo-600 hover:underline">
              Occupancy Rate Report
            </Link>
            <Link to="/reports/vacancy" className="text-indigo-600 hover:underline">
              Vacancy Report
            </Link>
            <Link to="/reports/expenses" className="text-indigo-600 hover:underline">
              Monthly Expense Report
            </Link>
            <Link
              to="/reports/lease-expiration"
              className="text-indigo-600 hover:underline"
            >
              Lease Expiration Forecast
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}