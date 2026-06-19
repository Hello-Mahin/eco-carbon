// Carbon Footprint Emission Factors (in kg CO2e per unit)
export const emissionFactors = {
  // Transportation: kg CO2e per km
  transport: {
    petrolCar: 0.170,     // per km (single occupant)
    dieselCar: 0.180,     // per km (single occupant)
    electricCar: 0.050,   // per km (average grid lifecycle)
    busLocal: 0.089,      // per passenger-km
    coachLong: 0.027,     // per passenger-km
    trainNational: 0.035, // per passenger-km
    flightDomestic: 0.246,// per passenger-km (<500km)
    flightShort: 0.156,   // per passenger-km (500km - 3500km)
    flightLong: 0.150,    // per passenger-km (>3500km)
    motorbike: 0.113,     // per km
    bicycle: 0.000,       // zero direct emissions
    walking: 0.000,       // zero direct emissions
  },

  // Food: kg CO2e per kg of food item
  food: {
    beef: 60.0,
    lamb: 24.0,
    cheese: 21.0,
    pork: 7.0,
    poultry: 6.0,
    eggs: 4.5,
    fishFarmed: 5.0,
    fishWild: 3.0,
    milk: 3.0,          // per kg/litre
    rice: 4.0,
    tofu: 2.0,
    processed: 3.5,
    bread: 1.4,
    fruits: 0.7,
    vegetables: 0.5,
    potatoes: 0.4,
    lentilsBeans: 0.9,
    nuts: 0.3,
  },

  // Food diet templates (kg CO2e per day)
  dietTemplates: {
    vegan: 2.0,
    vegetarian: 2.5,
    omnivoreAverage: 3.7,
    omnivoreHeavyMeat: 5.0,
  },

  // Home Energy: kg CO2e per kWh or unit
  energy: {
    electricityGrid: {
      in: 0.716, // India
      cn: 0.555, // China
      us: 0.370, // USA
      eu: 0.230, // EU average
      gb: 0.210, // UK
      fr: 0.056, // France (nuclear)
      solarLifecycle: 0.035,
      windLifecycle: 0.011,
    },
    naturalGasKwh: 0.185,
    naturalGasM3: 2.000,
    heatingOilKwh: 0.270,
    heatingOilLitre: 2.960,
    lpgKwh: 0.214,
    lpgLitre: 1.560,
    woodBiomassKwh: 0.015,
  },

  // Shopping: kg CO2e per item
  shopping: {
    tshirt: 5.0,
    jeans: 20.0,
    dress: 15.0,
    jacket: 30.0,
    shoes: 14.0,
    smartphone: 70.0,
    tablet: 100.0,
    laptop: 300.0,
    desktop: 750.0,
    television: 500.0,
    furnitureMedium: 85.0, // desk, chair, etc.
    furnitureLarge: 150.0, // bed, sofa, etc.
    groceriesBag: 7.0,     // avg reusable bag of items
  },

  // Waste: kg CO2e per kg
  waste: {
    landfillGeneral: 0.580,
    landfillFood: 0.700,
    recyclingAverage: 0.021,
    composting: 0.100,
    incineration: 0.330,
  },

  // Savings / Avoided emissions by recycling (kg CO2e saved per kg recycled)
  recyclingSavings: {
    aluminum: 9.0,
    paper: 1.0,
    plastic: 1.5,
    glass: 0.3,
    steel: 1.8,
  }
};

// Conversions & Equivalents
export const equivalents = {
  treeAnnualAbsorption: 22.0,    // 1 mature tree absorbs 22 kg CO2 per year
  carKmPerKgCo2: 5.9,             // 1 kg CO2 is approx 5.9 km driven in average petrol car
  flightKmPerKgCo2: 4.0,           // 1 kg CO2 is approx 4 km of domestic flight
  smartphoneChargesPerKgCo2: 125, // 1 kg CO2 is approx 125 full smartphone charges
};
