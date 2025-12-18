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

exports.calculateUnitPrice = (unit) => {
  const {
    basePriceEtb,
    floor,
    amenitiesConfig = [],
    viewAttributes = [],
  } = unit;

  if (basePriceEtb === undefined || floor === undefined) {
    throw new Error(
      "Missing required unit attributes for pricing calculation."
    );
  }

  const floorMultiplier = calculateFloorMultiplier(floor);
  const amenityMultiplier = calculateAmenityBonus(amenitiesConfig);
  const viewMultiplier = calculateViewBonus(viewAttributes);

  const finalPrice =
    basePriceEtb * floorMultiplier * amenityMultiplier * viewMultiplier;

  return Math.round(finalPrice);
};
