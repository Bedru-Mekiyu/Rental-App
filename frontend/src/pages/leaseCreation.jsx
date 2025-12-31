import { useState, useEffect, useMemo } from "react";

const tenants = ["Abebe Kebede", "Sara Mohammed"];
const units = [
  {
    id: 1,
    name: "Unit 101 - Studio",
    floor: 2,
    basePriceEtb: 15000,
    amenitiesConfig: ["Parking", "Generator"],
    viewAttributes: ["City"],
  },
  {
    id: 2,
    name: "Unit 402 - 2BR",
    floor: 7,
    basePriceEtb: 22000,
    amenitiesConfig: ["Parking", "Elevator", "Security"],
    viewAttributes: ["City", "Garden"],
  },
];

const calculateFloorMultiplier = (floor) => {
  if (floor <= 1) return 1.2; // +20% premium
  if (floor <= 5) return 1.0; // normal
  if (floor <= 10) return 0.95; // -5%
  return 0.9; // highest floors slightly cheaper
};

const calculateAmenityBonus = (amenities = []) => {
  // Add +2% per amenity
  return 1 + amenities.length * 0.02;
};

const calculateViewBonus = (views = []) => {
  // Good views add +3% each
  return 1 + views.length * 0.03;
};

export default function LeaseCreation() {
  const [tenant, setTenant] = useState("");
  const [unitId, setUnitId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr gap-6 p-6 min-h-screen bg-gray-50]">
      {/* left */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 ">Create New Lease</h2>
        <div className="bg-white p-5 mb-5 rounded-xl shadow-sm">
          <h4 className="mb-4 font-semibold">Tenant &Unit Selection</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tenant Name</label>
              <select
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option>Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Lease Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Lease End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="space-y-4"></div>
    </div>
  );
}
