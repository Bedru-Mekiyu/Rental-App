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
  const [deposit, setDeposit] = useState("");

  const selectedUnit = units.find((u) => u.id === Number(unitId));

  //   useEffect(() => {}, []);
  //   useEffect(() => {
  //     if (!selectedUnit) return;
  //   }, [selectedUnit]);

  const rentSummary = useMemo(() => {
    if (!selectedUnit) return null;

    const baseRent = selectedUnit.basePriceEtb;
    const floorMultiplier = calculateFloorMultiplier(selectedUnit.floor);
    const amenityMultiplier = calculateAmenityBonus(
      selectedUnit.amenitiesConfig,
    );
    const viewMultiplier = calculateViewBonus(selectedUnit.viewAttributes);

    const afterFloor = baseRent * floorMultiplier;
    const afterAmenities = afterFloor * amenityMultiplier;
    const finalBeforeTax = afterAmenities * viewMultiplier;
    const tax = Math.round(finalBeforeTax * 0.15);

    return {
      baseRent,
      floorAdjustment: Math.round(afterFloor - baseRent),
      amenityAdjustment: Math.round(afterAmenities - afterFloor),
      viewAdjustment: Math.round(finalBeforeTax - afterAmenities),
      tax,
      total: Math.round(finalBeforeTax + tax),
    };
  }, [selectedUnit]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-6 p-6 min-h-screen bg-gray-50]">
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
                <option value="">Select Tenant</option>
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
        {rentSummary && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <h4 className="mb-4 font-semibold">Rent Calculation Summary</h4>
            {[
              ["Base Rent", rentSummary.baseRent],
              ["Floor Adjustment", rentSummary.floorAdjustment],
              ["Amenities Adjustment", rentSummary.amenityAdjustment],
              ["View Adjustment", rentSummary.viewAdjustment],
              ["Tax (15%)", rentSummary.tax],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between mb-2 text-sm">
                <span>{label}</span>
                <span>ETB {value}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-indigo-600 border-t mt-3 pt-3">
              <span>Total Monthly rent</span>
              <span>ETB {rentSummary.total}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-5 ">
          <h4 className="font-semibold mb-4 ">Additional Terms & Notes</h4>
          <div className="space-y-4 ">
            <div>
              <label className="text-sm font-medium">
                Security Deposit (ETB)
              </label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                name=""
                id=""
                rows="3"
                placeholder="Special lease terms..."
                className="w-full mt-1 border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-dashed">
          <h4 className="font-semibold mb-2">Lease Document Preview</h4>
          <p className="text-sm text-gray-500 mb-4 ">No preview generated</p>
          <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
            Generate Preview
          </button>
        </div>
        <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
          Finalize Lease
        </button>
        <button className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
