import { useState, useMemo, useEffect } from "react";

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

const calculateRentPreview = ({ baseRent, unit }) => {
  const floorMultiplier = calculateFloorMultiplier(unit.floor);
  const amenityMultiplier = calculateAmenityBonus(unit.amenitiesConfig);
  const viewMultiplier = calculateViewBonus(unit.viewAttributes);

  const afterFloor = baseRent * floorMultiplier;
  const afterAmenties = afterFloor * amenityMultiplier * viewMultiplier;

  return {
    baseRent,
    floorAdjustment: Math.round(afterFloor - baseRent),
    amenityAdjustment: Math.round(afterAmenties - afterFloor),
    total: Math.round(afterAmenties),
  };
};

export default function unitManagement() {
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  useEffect(() => {
    const mockUnit = [
      {
        id: 1,
        name: "Unit 101 (5th floor)",
        floor: 5,
        amenitiesConfig: ["Balcony", "Parking"],
        viewAttributes: ["City View"],
      },
    ];

    setUnits(mockUnit);
    setSelectedUnitId(mockUnit[0].id);
  }, []);
}
