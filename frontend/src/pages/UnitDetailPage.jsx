// src/pages/UnitDetailPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import ResponsiveSection from "../components/ResponsiveSection";
import PageHeader from "../components/PageHeader";
import SkeletonRow from "../components/SkeletonRow";
import SkeletonTable from "../components/SkeletonTable";
import SkeletonCard from "../components/SkeletonCard";
import MobileBackBar from "../components/MobileBackBar";

export default function UnitDetailPage() {
  const { id: unitId } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadUnit = useCallback(async () => {
    try {
      setLoading(true);
      const [unitRes, leasesRes] = await Promise.all([
        API.get(`/units/${unitId}`),
        API.get("/leases", { params: { unitId } }),
      ]);
      setUnit(unitRes.data?.data || null); // backend returns { success, data }
      setLeases(leasesRes.data?.data || []);
    } catch {
      toast.error("Failed to load unit details");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    if (!unitId || unitId === "undefined") {
      navigate("/units");
      return;
    }
    loadUnit();
  }, [unitId, loadUnit, navigate]);

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
      <div className="space-y-6">
        <PageHeader
          eyebrow="Unit"
          eyebrowClassName="bg-neutral-100 text-neutral-700"
          title="Unit Detail"
          subtitle="Loading unit details..."
        />
        <SkeletonCard title="Unit Information">
          <div className="grid gap-4 md:grid-cols-3">
            <SkeletonRow className="h-16 w-full" />
            <SkeletonRow className="h-16 w-full" />
            <SkeletonRow className="h-16 w-full" />
          </div>
        </SkeletonCard>
        <SkeletonCard title="Lease History">
          <SkeletonTable rows={4} columns={5} />
        </SkeletonCard>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger-600">Unit not found.</p>
        <button
          onClick={() => navigate("/units")}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
        >
          Back to units
        </button>
      </div>
    );
  }

  const activeLease = leases.find((l) => l.status === "ACTIVE");
  const unitStatusClass =
    unit.status === "VACANT"
      ? "bg-success-100 text-success-700"
      : unit.status === "MAINTENANCE"
      ? "bg-warning-100 text-warning-700"
      : "bg-neutral-100 text-neutral-700";
  const leaseStatusClass = (value) =>
    value === "ACTIVE"
      ? "bg-success-100 text-success-700"
      : value === "ENDED"
      ? "bg-neutral-100 text-neutral-700"
      : "bg-warning-100 text-warning-700";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Unit"
        eyebrowClassName="bg-primary-100 text-primary-700"
        title={unit.name || "Unit Detail"}
        subtitle={`${unit.address || "No address"} · Floor ${unit.floor ?? "N/A"} · ${unit.status}`}
        backTo="/units"
        backLabel="Back to Units"
      />

      {/* Unit info */}
      <ResponsiveSection title="Unit Information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${unitStatusClass} mt-2`}>
              {unit.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Base Price</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {formatCurrency(unit.basePriceEtb)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Type</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {unit.unitType || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Bedrooms</p>
            <p className="mt-1 text-sm">{unit.bedrooms ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Bathrooms</p>
            <p className="mt-1 text-sm">{unit.bathrooms ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Created</p>
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
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60"
          >
            Mark as VACANT
          </button>
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => handleChangeStatus("MAINTENANCE")}
            className="rounded-md border border-warning-300 px-3 py-1.5 text-xs font-medium text-warning-700 disabled:opacity-60"
          >
            Mark as MAINTENANCE
          </button>
        </div>
      </ResponsiveSection>

      {/* Lease history */}
      <ResponsiveSection
        title="Lease History"
        description="Current and past leases associated with this unit."
      >
        {leases.length === 0 ? (
          <div className="space-y-3">
            <SkeletonTable rows={3} columns={5} />
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-6 text-center">
              <div className="text-sm font-medium text-neutral-700">No leases found</div>
              <div className="mt-1 text-xs text-neutral-500">
                This unit has no lease history yet.
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-xs">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-500">
                    Tenant
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-500">
                    Term
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-500">
                    Rent (ETB)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {leases.map((lease) => (
                  <tr key={lease._id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2">
                      {lease.tenantId?.fullName || "Tenant"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${leaseStatusClass(lease.status)}`}
                      >
                        {lease.status}
                      </span>
                    </td>
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
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
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
          <p className="mt-3 text-xs text-neutral-500">
            Active lease:{" "}
            <Link
              to={`/leases/${activeLease._id}`}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              {activeLease.tenantId?.fullName || "Tenant"}
            </Link>
            .
          </p>
        )}
      </ResponsiveSection>
      <MobileBackBar to="/units" label="Back to Units" />
    </div>
  );
}
