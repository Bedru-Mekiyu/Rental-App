// src/pages/UnitDetailPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";

export default function UnitDetailPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadUnit();
  }, [unitId, loadUnit]);

  const loadUnit = useCallback(async () => {
    try {
      setLoading(true);
      const [unitRes, leasesRes] = await Promise.all([
        API.get(`/units/${unitId}`),
        API.get("/leases", { params: { unitId } }),
      ]);
      setUnit(unitRes.data?.data || null); // backend returns { success, data }
      setLeases(leasesRes.data || []);
    } catch {
      toast.error("Failed to load unit details");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  const handleChangeStatus = async (status) => {
    try {
      setUpdatingStatus(true);
      await API.put(`/units/${unitId}`, { status }); // uses updateUnit (PUT)
      toast.success(`Unit marked as ${status}`);
      loadUnit();
    } catch {
      toast.error("Failed to update unit status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(v || 0);

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading unit...</div>
    );
  }

  if (!unit) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Unit not found.</p>
        <button
          onClick={() => navigate("/units")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back to units
        </button>
      </div>
    );
  }

  const activeLease = leases.find((l) => l.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {unit.name || "Unit Detail"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {unit.address || "No address"} · Floor {unit.floor ?? "N/A"} ·{" "}
            {unit.status}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/units")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back to Units
        </button>
      </header>

      {/* Unit info */}
      <DashboardCard title="Unit Information">
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {unit.status}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Base Price</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatCurrency(unit.basePriceEtb)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Type</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {unit.unitType || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Bedrooms</p>
            <p className="mt-1 text-sm">{unit.bedrooms ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Bathrooms</p>
            <p className="mt-1 text-sm">{unit.bathrooms ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Created</p>
            <p className="mt-1 text-sm">
              {unit.createdAt
                ? new Date(unit.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => handleChangeStatus("VACANT")}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-60"
          >
            Mark as VACANT
          </button>
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => handleChangeStatus("MAINTENANCE")}
            className="rounded-md border border-amber-400 px-3 py-1.5 text-xs font-medium text-amber-700 disabled:opacity-60"
          >
            Mark as MAINTENANCE
          </button>
        </div>
      </DashboardCard>

      {/* Lease history */}
      <DashboardCard
        title="Lease History"
        description="Current and past leases associated with this unit."
      >
        {leases.length === 0 ? (
          <p className="text-xs text-slate-500">
            No leases found for this unit.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-500">
                    Tenant
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-500">
                    Term
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-500">
                    Rent (ETB)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leases.map((lease) => (
                  <tr key={lease._id}>
                    <td className="px-4 py-2">
                      {lease.tenantId?.fullName || "Tenant"}
                    </td>
                    <td className="px-4 py-2">{lease.status}</td>
                    <td className="px-4 py-2">
                      {lease.startDate
                        ? new Date(
                            lease.startDate
                          ).toLocaleDateString()
                        : "—"}{" "}
                      –{" "}
                      {lease.endDate
                        ? new Date(
                            lease.endDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {formatCurrency(lease.monthlyRentEtb || 0)}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/leases/${lease._id}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        View lease
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeLease && (
          <p className="mt-3 text-xs text-slate-500">
            Active lease:{" "}
            <Link
              to={`/leases/${activeLease._id}`}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {activeLease.tenantId?.fullName || "Tenant"}
            </Link>
            .
          </p>
        )}
      </DashboardCard>
    </div>
  );
}
