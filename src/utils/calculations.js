import { emissionFactors } from '../data/emissionFactors.js';

export const calculations = {
  // 1. Calculate Transport Emissions
  calculateTransport(type, km) {
    const factor = emissionFactors.transport[type] || 0;
    return factor * km;
  },

  // 2. Calculate Food Emissions
  calculateFood(type, kg) {
    const factor = emissionFactors.food[type] || 0;
    return factor * kg;
  },

  // 3. Calculate Energy Emissions
  calculateEnergy(type, kwh, countryCode = 'in') {
    if (type === 'electricity') {
      const factor = emissionFactors.energy.electricityGrid[countryCode] || emissionFactors.energy.electricityGrid.in;
      return factor * kwh;
    }
    const factor = emissionFactors.energy[type] || 0;
    return factor * kwh;
  },

  // 4. Calculate Shopping Emissions
  calculateShopping(type, quantity) {
    const factor = emissionFactors.shopping[type] || 0;
    return factor * quantity;
  },

  // 5. Calculate Waste Emissions
  calculateWaste(type, kg) {
    const factor = emissionFactors.waste[type] || 0;
    return factor * kg;
  },

  // 6. Calculate total baseline footprint from onboarding wizard answers
  calculateBaseline(surveyAnswers) {
    let annualCO2 = 0; // in kg CO2 per year

    // A. Transport (km/year)
    const carType = surveyAnswers.carType || 'petrolCar';
    const carKm = parseFloat(surveyAnswers.carKm || 0) * 52; // weekly to annual
    annualCO2 += this.calculateTransport(carType, carKm);

    const transitKm = parseFloat(surveyAnswers.transitKm || 0) * 52;
    annualCO2 += this.calculateTransport('busLocal', transitKm);

    const flightsDomestic = parseFloat(surveyAnswers.flightsDomestic || 0) * 500; // avg 500km
    annualCO2 += this.calculateTransport('flightDomestic', flightsDomestic);

    const flightsIntl = parseFloat(surveyAnswers.flightsIntl || 0) * 5000; // avg 5000km
    annualCO2 += this.calculateTransport('flightLong', flightsIntl);

    // B. Food (annual based on diet type)
    const dietType = surveyAnswers.dietType || 'omnivoreAverage';
    const dailyFoodCo2 = emissionFactors.dietTemplates[dietType] || 3.7;
    annualCO2 += dailyFoodCo2 * 365;

    // C. Energy (annual kWh)
    const electricityKwh = parseFloat(surveyAnswers.electricityKwh || 0) * 12; // monthly to annual
    const country = surveyAnswers.country || 'in';
    annualCO2 += this.calculateEnergy('electricity', electricityKwh, country);

    const gasKwh = parseFloat(surveyAnswers.gasKwh || 0) * 12;
    annualCO2 += this.calculateEnergy('naturalGasKwh', gasKwh);

    // D. Shopping
    const clothesPerMonth = parseFloat(surveyAnswers.clothesPerMonth || 0) * 12;
    annualCO2 += this.calculateShopping('tshirt', clothesPerMonth * 0.7); // mix of shirts & jeans
    annualCO2 += this.calculateShopping('jeans', clothesPerMonth * 0.3);

    const techPerYear = parseFloat(surveyAnswers.techPerYear || 0);
    annualCO2 += this.calculateShopping('smartphone', techPerYear * 0.8);
    annualCO2 += this.calculateShopping('laptop', techPerYear * 0.2);

    // E. Waste
    const wastePerWeek = parseFloat(surveyAnswers.wastePerWeek || 5); // kg/week
    const recyclePercent = parseFloat(surveyAnswers.recyclePercent || 20) / 100;
    const compostPercent = parseFloat(surveyAnswers.compostPercent || 10) / 100;
    
    const annualWaste = wastePerWeek * 52;
    const recycledAmount = annualWaste * recyclePercent;
    const compostedAmount = annualWaste * compostPercent;
    const landfillAmount = annualWaste - recycledAmount - compostedAmount;

    annualCO2 += this.calculateWaste('landfillGeneral', landfillAmount);
    annualCO2 += this.calculateWaste('recyclingAverage', recycledAmount);
    annualCO2 += this.calculateWaste('composting', compostedAmount);

    return annualCO2 / 1000; // return in tonnes CO2 per year
  },

  // 7. Aggregate logged activities
  aggregateStats(activities) {
    const stats = {
      total: 0, // kg CO2
      categories: {
        transport: 0,
        food: 0,
        energy: 0,
        shopping: 0,
        waste: 0
      },
      dailyAverage: 0,
      streak: 0,
      treesEquivalent: 0,
      phoneChargesEquivalent: 0,
      carKmEquivalent: 0
    };

    if (activities.length === 0) return stats;

    activities.forEach(activity => {
      const co2 = parseFloat(activity.co2 || 0);
      stats.total += co2;
      
      const cat = activity.category;
      if (stats.categories[cat] !== undefined) {
        stats.categories[cat] += co2;
      }
    });

    // Find unique days logged to calculate averages
    const uniqueDays = new Set(activities.map(a => a.date.split('T')[0]));
    const totalDays = Math.max(1, uniqueDays.size);
    stats.dailyAverage = stats.total / totalDays;

    // Equivalents
    stats.treesEquivalent = stats.total / 22.0; // 1 tree = 22 kg CO2 per year
    stats.phoneChargesEquivalent = stats.total * 125; // 1 kg = 125 charges
    stats.carKmEquivalent = stats.total * 5.9; // 1 kg = 5.9 km driven

    return stats;
  },

  // Get historical carbon emissions by day for the last N days
  getHistoryByDay(activities, days = 7) {
    const history = {};
    const today = new Date();

    // Initialize days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      history[dateStr] = 0;
    }

    // Accumulate
    activities.forEach(activity => {
      const dateStr = activity.date.split('T')[0];
      if (history[dateStr] !== undefined) {
        history[dateStr] += parseFloat(activity.co2 || 0);
      }
    });

    return history;
  },

  // Get historical carbon emissions by month for the current year
  getHistoryByMonth(activities) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const history = {};
    months.forEach(m => { history[m] = 0; });

    const currentYear = new Date().getFullYear();

    activities.forEach(activity => {
      const date = new Date(activity.date);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        history[monthName] += parseFloat(activity.co2 || 0);
      }
    });

    return history;
  }
};
