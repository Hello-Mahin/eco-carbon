import { calculations } from './calculations.js';
import { dailyChallenges } from '../data/challenges.js';
import { toast } from '../components/toast.js';

const STORAGE_KEY = 'carbon_tracker_app_state';

const defaultState = {
  profile: {
    name: 'Eco Warrior',
    country: 'in',
    lifestyle: 'average',
    onboarded: false,
    baselineCo2: 2.0,
    xp: 0,
    level: 1,
    joinDate: new Date().toISOString()
  },
  activities: [], // array of { id, date, category, type, quantity, co2, unit, label }
  completedChallenges: {}, // map of date -> array of challengeIds
  unlockedBadges: ['first_step'], // array of badgeIds
  goals: {
    monthlyTarget: 150, // in kg CO2 per month
    reductionPercent: 15
  },
  theme: 'dark',
  apiKey: ''
};

export const storage = {
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.save(defaultState);
      return JSON.parse(JSON.stringify(defaultState));
    }
    try {
      // Merge with default state to handle schema changes gracefully
      const parsed = JSON.parse(data);
      return {
        ...defaultState,
        ...parsed,
        profile: { ...defaultState.profile, ...parsed.profile },
        goals: { ...defaultState.goals, ...parsed.goals }
      };
    } catch (e) {
      console.error('Error parsing storage data', e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  },

  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return this.load();
  },

  getProfile() {
    return this.load().profile;
  },

  updateProfile(updates) {
    const state = this.load();
    state.profile = { ...state.profile, ...updates };
    
    // Check level up based on XP
    // Level formula: Level = Math.floor(Math.sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
    }
    
    this.save(state);
    return state.profile;
  },

  addXP(amount) {
    const state = this.load();
    state.profile.xp += amount;
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    let leveledUp = false;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
      leveledUp = true;
    }
    this.save(state);
    return { profile: state.profile, leveledUp };
  },

  getActivities() {
    return this.load().activities;
  },

  addActivity(activity) {
    const state = this.load();
    const newActivity = {
      id: 'act_' + Math.random().toString(36).slice(2, 11),
      date: new Date().toISOString(),
      ...activity
    };
    state.activities.unshift(newActivity);
    
    // Calculate XP for logging
    state.profile.xp += 15; // 15 XP per logged activity
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
      toast.info(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
    }
    
    this.checkAndUnlockBadges(state);
    
    this.save(state);
    return { activity: newActivity, state };
  },

  deleteActivity(id) {
    const state = this.load();
    state.activities = state.activities.filter(a => a.id !== id);
    this.save(state);
    return state;
  },

  getCompletedChallenges(dateStr) {
    const date = dateStr || new Date().toISOString().split('T')[0];
    return this.load().completedChallenges[date] || [];
  },

  completeChallenge(challengeId, savingCo2, xpAmount) {
    const state = this.load();
    const date = new Date().toISOString().split('T')[0];
    
    if (!state.completedChallenges[date]) {
      state.completedChallenges[date] = [];
    }
    
    if (state.completedChallenges[date].includes(challengeId)) {
      return { success: false, msg: 'Already completed today' };
    }
    
    state.completedChallenges[date].push(challengeId);
    
    // Add XP
    state.profile.xp += xpAmount;
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    let leveledUp = false;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
      leveledUp = true;
    }
    
    this.checkAndUnlockBadges(state);
    
    this.save(state);
    return { success: true, state, leveledUp };
  },

  getUnlockedBadges() {
    return this.load().unlockedBadges;
  },

  unlockBadge(badgeId) {
    const state = this.load();
    if (state.unlockedBadges.includes(badgeId)) {
      return false;
    }
    state.unlockedBadges.push(badgeId);
    state.profile.xp += 100; // 100 XP for unlocking a badge!
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
    }
    this.save(state);
    return true;
  },

  getGoals() {
    return this.load().goals;
  },

  updateGoals(updates) {
    const state = this.load();
    state.goals = { ...state.goals, ...updates };
    this.save(state);
    return state.goals;
  },

  getTheme() {
    return this.load().theme;
  },

  setTheme(theme) {
    const state = this.load();
    state.theme = theme;
    this.save(state);
    return theme;
  },

  getApiKey() {
    return this.load().apiKey;
  },

  setApiKey(key) {
    const state = this.load();
    state.apiKey = key;
    this.save(state);
  },

  checkAndUnlockBadges(state) {
    const unlocked = [];
    
    // 1. Eco Logger
    if (state.activities.length >= 1) {
      if (this.unlockBadgeDirect(state, 'eco_logger')) {
        unlocked.push('Eco Logger');
      }
    }
    
    // 2. Streak Badges
    const stats = calculations.aggregateStats(state.activities);
    if (stats.streak >= 3) {
      if (this.unlockBadgeDirect(state, 'streak_3')) {
        unlocked.push('Green Streak');
      }
    }
    if (stats.streak >= 7) {
      if (this.unlockBadgeDirect(state, 'streak_7')) {
        unlocked.push('Eco Warrior');
      }
    }
    
    // 3. Vegan Badge (5 vegan meals)
    const veganMeals = state.activities.filter(a => a.type === 'vegan').length;
    if (veganMeals >= 5) {
      if (this.unlockBadgeDirect(state, 'vegan_badge')) {
        unlocked.push('Plant Powered');
      }
    }
    
    // 4. Transit Badge (5 public transit/cycle)
    const transitCount = state.activities.filter(a => 
      a.category === 'transport' && 
      (a.type === 'busLocal' || a.type === 'trainNational' || a.type === 'bicycle' || a.type === 'bus' || a.type === 'transit')
    ).length;
    if (transitCount >= 5) {
      if (this.unlockBadgeDirect(state, 'transit_badge')) {
        unlocked.push('Public Transport Pro');
      }
    }
    
    // 5. Zero Waste Badge (5 waste reduction logs)
    const wasteCount = state.activities.filter(a => 
      a.category === 'waste' && 
      (a.type === 'recyclingAverage' || a.type === 'composting')
    ).length;
    if (wasteCount >= 5) {
      if (this.unlockBadgeDirect(state, 'zero_waste_badge')) {
        unlocked.push('Zero Waste Champ');
      }
    }
    
    // 6. Savings Badges
    const completedIds = Object.values(state.completedChallenges).flat();
    const totalCo2Saved = completedIds.reduce((sum, id) => {
      const ch = dailyChallenges.find(c => c.id === id);
      return sum + (ch ? ch.saving : 0);
    }, 0);
    
    if (totalCo2Saved >= 10) {
      if (this.unlockBadgeDirect(state, 'co2_saved_10')) {
        unlocked.push('Carbon Cutter');
      }
    }
    if (totalCo2Saved >= 50) {
      if (this.unlockBadgeDirect(state, 'co2_saved_50')) {
        unlocked.push('Forest Friend');
      }
    }
    if (totalCo2Saved >= 100) {
      if (this.unlockBadgeDirect(state, 'co2_saved_100')) {
        unlocked.push('Planet Savior');
      }
    }
  },

  unlockBadgeDirect(state, badgeId) {
    if (state.unlockedBadges.includes(badgeId)) {
      return false;
    }
    state.unlockedBadges.push(badgeId);
    state.profile.xp += 100;
    
    // Level up check
    const newLevel = Math.floor(Math.sqrt(state.profile.xp / 100)) + 1;
    if (newLevel > state.profile.level) {
      state.profile.level = newLevel;
      toast.info(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
    }
    return true;
  }
};
