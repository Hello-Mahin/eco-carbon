import test from 'node:test';
import assert from 'node:assert';

// Mock localStorage globally for Node.js test environment
globalThis.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Import storage utility after mocking localStorage
import { storage } from '../src/utils/storage.js';

test('Storage - load and default state', () => {
  localStorage.clear();
  const state = storage.load();
  assert.ok(state, 'Loaded state should be valid');
  assert.strictEqual(state.profile.onboarded, false);
  assert.strictEqual(state.profile.name, 'Eco Warrior');
});

test('Storage - updateProfile', () => {
  localStorage.clear();
  const profile = storage.updateProfile({ name: 'Mahin Test', country: 'us' });
  assert.strictEqual(profile.name, 'Mahin Test');
  assert.strictEqual(profile.country, 'us');
});

test('Storage - addXP & levelUp checks', () => {
  localStorage.clear();
  // Check level 1 default
  let profile = storage.getProfile();
  assert.strictEqual(profile.level, 1);

  // Add XP to trigger level up
  // Level = Math.floor(Math.sqrt(XP / 100)) + 1
  // To get level 2, need 100 XP
  const result = storage.addXP(100);
  assert.strictEqual(result.leveledUp, true);
  assert.strictEqual(result.profile.level, 2);
});

test('Storage - addActivity and deleteActivity', () => {
  localStorage.clear();
  const result = storage.addActivity({
    category: 'transport',
    type: 'petrolCar',
    quantity: 10,
    unit: 'km',
    label: 'Car drive',
    co2: 1.7
  });

  assert.ok(result.activity.id, 'Activity should have an generated ID');
  assert.strictEqual(result.state.activities.length, 1);
  assert.strictEqual(result.state.activities[0].label, 'Car drive');

  // Delete activity
  const nextState = storage.deleteActivity(result.activity.id);
  assert.strictEqual(nextState.activities.length, 0, 'Activities should be empty after delete');
});

test('Storage - completeChallenge', () => {
  localStorage.clear();
  const dateStr = new Date().toISOString().split('T')[0];
  
  const result = storage.completeChallenge('meatless_monday', 3.5, 50);
  assert.strictEqual(result.success, true);
  
  const completedList = storage.getCompletedChallenges(dateStr);
  assert.ok(completedList.includes('meatless_monday'), 'meatless_monday should be logged as completed');

  // Attempt duplicate completion
  const duplicateResult = storage.completeChallenge('meatless_monday', 3.5, 50);
  assert.strictEqual(duplicateResult.success, false);
});
