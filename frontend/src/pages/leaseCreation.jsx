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

export default function LeaseCreation() {}
