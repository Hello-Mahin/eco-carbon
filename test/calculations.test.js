import test from 'node:test';
import assert from 'node:assert';
import { calculations } from '../src/utils/calculations.js';

test('Calculations - calculateTransport petrolCar', () => {
  const co2 = calculations.calculateTransport('petrolCar', 100);
  // Petrol Car factor = 0.170 kg/km * 100 = 17 kg
  assert.strictEqual(co2, 17.0);
});

test('Calculations - calculateTransport electricCar', () => {
  const co2 = calculations.calculateTransport('electricCar', 50);
  // Electric Car factor = 0.050 kg/km * 50 = 2.5 kg
  assert.strictEqual(co2, 2.5);
});

test('Calculations - calculateFood beef', () => {
  const co2 = calculations.calculateFood('beef', 2);
  // Beef factor = 60.0 kg/kg * 2 = 120 kg
  assert.strictEqual(co2, 120.0);
});

test('Calculations - calculateFood lentils', () => {
  const co2 = calculations.calculateFood('lentilsBeans', 5);
  // Lentils/Beans factor = 0.9 kg/kg * 5 = 4.5 kg
  assert.strictEqual(co2, 4.5);
});

test('Calculations - calculateEnergy electricity in India', () => {
  const co2 = calculations.calculateEnergy('electricity', 100, 'in');
  // India electricity factor = 0.716 * 100 = 71.6 kg
  assert.strictEqual(co2, 71.6);
});

test('Calculations - calculateEnergy other fuels', () => {
  // naturalGasKwh factor = 0.185 * 100 = 18.5 kg
  assert.strictEqual(calculations.calculateEnergy('naturalGasKwh', 100), 18.5);
  // heatingOilLitre factor = 2.680 * 50 = 134.0 kg
  assert.strictEqual(calculations.calculateEnergy('heatingOilLitre', 50), 134.00);
  // lpgLitre factor = 1.560 * 20 = 31.2 kg
  assert.strictEqual(calculations.calculateEnergy('lpgLitre', 20), 31.20);
});

test('Calculations - calculateShopping laptop', () => {
  const co2 = calculations.calculateShopping('laptop', 1);
  // Laptop factor = 300 kg * 1 = 300 kg
  assert.strictEqual(co2, 300.0);
});

test('Calculations - calculateWaste landfill', () => {
  const co2 = calculations.calculateWaste('landfillGeneral', 10);
  // General waste factor = 0.580 * 10 = 5.8 kg
  assert.strictEqual(co2, 5.8);
});

test('Calculations - calculateBaseline annual footprint', () => {
  const surveyAnswers = {
    name: 'Test User',
    country: 'in',
    dietType: 'vegan',
    carType: 'electricCar',
    carKm: 10,
    transitKm: 20,
    flightsDomestic: 2,
    flightsIntl: 0,
    electricityKwh: 100,
    gasKwh: 0,
    clothesPerMonth: 1,
    techPerYear: 0,
    wastePerWeek: 5,
    recyclePercent: 50,
    compostPercent: 50
  };

  const baseline = calculations.calculateBaseline(surveyAnswers);
  assert.ok(baseline > 0, 'Baseline footprint should be positive');
  assert.ok(baseline < 10, 'Baseline for a green vegan should be reasonably small');
});

test('Calculations - aggregateStats empty activities', () => {
  const stats = calculations.aggregateStats([]);
  assert.strictEqual(stats.total, 0);
  assert.strictEqual(stats.categories.transport, 0);
});

test('Calculations - aggregateStats values', () => {
  const mockActivities = [
    { category: 'transport', co2: 10.5, date: '2026-06-19T12:00:00Z' },
    { category: 'food', co2: 5.0, date: '2026-06-19T12:00:00Z' },
    { category: 'energy', co2: 20.0, date: '2026-06-20T12:00:00Z' }
  ];

  const stats = calculations.aggregateStats(mockActivities);
  assert.strictEqual(stats.total, 35.5);
  assert.strictEqual(stats.categories.transport, 10.5);
  assert.strictEqual(stats.categories.food, 5.0);
  assert.strictEqual(stats.categories.energy, 20.0);
});

test('Calculations - getHistoryByDay', () => {
  const mockActivities = [
    { category: 'transport', co2: 10, date: new Date().toISOString() },
    { category: 'food', co2: 5, date: new Date().toISOString() }
  ];
  
  const history = calculations.getHistoryByDay(mockActivities, 7);
  const todayStr = new Date().toISOString().split('T')[0];
  
  assert.ok(history[todayStr] !== undefined);
  assert.strictEqual(history[todayStr], 15.0);
});

test('Calculations - getHistoryByMonth', () => {
  const currentYear = new Date().getFullYear();
  const mockActivities = [
    { category: 'transport', co2: 25, date: `${currentYear}-06-15T12:00:00Z` },
    { category: 'food', co2: 15, date: `${currentYear}-06-16T12:00:00Z` }
  ];

  const history = calculations.getHistoryByMonth(mockActivities);
  assert.strictEqual(history['Jun'], 40.0);
});
