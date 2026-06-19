import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { toast } from '../components/toast.js';

export function renderProfile() {
  const container = helpers.createElement('div', 'page profile-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Profile & Settings' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Manage your Google Gemini API configuration, local database, and account options.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  const profile = storage.getProfile();

  // ------------------------------------
  // GRID: PROFILE CARD & API SETTINGS
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // User Profile Card (Left)
  const profileTitle = helpers.createElement('h3', [], { text: 'Account Profile', style: 'margin-bottom: 20px;' });
  
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'EW';
  const avatar = helpers.createElement('div', 'sidebar-avatar', { 
    text: initials,
    style: 'width: 80px; height: 80px; font-size: 1.8rem; margin: 0 auto 16px; border-radius: 50%; box-shadow: 0 0 20px rgba(16,185,129,0.3);'
  });

  const uName = helpers.createElement('h4', [], { text: profile.name, style: 'font-size: 1.25rem; font-weight:700; text-align:center; margin-bottom: 4px;' });
  const uLevel = helpers.createElement('div', [], { text: `Eco Level ${profile.level}`, style: 'font-size: 0.85rem; font-weight:600; color: var(--primary-color); text-align:center; margin-bottom: 20px;' });

  const profileDetails = helpers.createElement('div', [], { style: 'border-top: 1px solid var(--border-color); padding-top: 16px; font-size: 0.9rem; color: var(--text-secondary);' });
  
  const detailRows = [
    { label: 'Country Average reference', val: profile.country.toUpperCase() },
    { label: 'Lifestyle Diet baseline', val: profile.lifestyle.charAt(0).toUpperCase() + profile.lifestyle.slice(1) },
    { label: 'Baseline footprint', val: `${profile.baselineCo2.toFixed(2)} t CO₂/yr` },
    { label: 'Earned XP Points', val: `${profile.xp} XP` }
  ];

  detailRows.forEach(row => {
    const rLabel = helpers.createElement('span', [], { text: row.label });
    const rVal = helpers.createElement('span', [], { text: row.val, style: 'font-weight: 600; color: var(--text-primary)' });
    const rBox = helpers.createElement('div', [], { style: 'display:flex; justify-content:space-between; margin-bottom: 10px;' }, [rLabel, rVal]);
    profileDetails.appendChild(rBox);
  });

  const profileCard = helpers.createElement('div', 'glass-card', { style: 'text-align:center;' }, [
    profileTitle, 
    avatar, 
    uName, 
    uLevel, 
    profileDetails
  ]);
  mainGrid.appendChild(profileCard);

  // Gemini API Configurations (Right)
  const apiTitle = helpers.createElement('h3', [], { text: 'Google Gemini API Setup', style: 'margin-bottom: 8px;' });
  const apiDesc = helpers.createElement('p', [], { 
    text: 'Insert your personal Google Gemini API key to activate live, context-aware chatbot conversations and weekly insights plans.',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;'
  });

  const apiKeyGroup = helpers.createElement('div', 'form-group');
  const apiKeyLabel = helpers.createElement('label', 'form-label', { text: 'Gemini API Key:', for: 'profile-api-key' });
  const apiKeyInput = helpers.createElement('input', 'form-control', { 
    type: 'password', 
    placeholder: 'AIzaSy...', 
    value: storage.getApiKey(),
    id: 'profile-api-key'
  });
  apiKeyGroup.appendChild(apiKeyLabel);
  apiKeyGroup.appendChild(apiKeyInput);

  const saveApiBtn = helpers.createElement('button', ['btn', 'btn-primary'], { text: 'Save API Settings', style: 'width: 100%; margin-top: 10px;' });
  
  saveApiBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    storage.setApiKey(key);
    if (key) {
      toast.success('Gemini API key configured successfully! AI functions unlocked.');
    } else {
      toast.info('API key cleared. AI features will run in Demo mode.');
    }
  });

  const apiCard = helpers.createElement('div', 'glass-card', {}, [
    apiTitle, 
    apiDesc, 
    apiKeyGroup, 
    saveApiBtn
  ]);
  mainGrid.appendChild(apiCard);
  container.appendChild(mainGrid);

  // ------------------------------------
  // SECTION: SIMULATION & RESET ACTIONS
  // ------------------------------------
  const devTitle = helpers.createElement('h3', [], { text: 'App Database & Simulation Controls', style: 'margin-bottom: 20px; margin-top: 24px;' });
  
  const devActionsContainer = helpers.createElement('div', 'grid-2');

  // Fill Mock Data Card
  const mockCardTitle = helpers.createElement('h4', [], { text: 'Screenshot Simulation', style: 'font-size:1rem; margin-bottom: 8px;' });
  const mockCardDesc = helpers.createElement('p', [], { 
    text: 'Inject 15+ mock activities over the past 3 weeks into your database. Instantly generates beautiful, populated dashboard charts ready for LinkedIn screenshots!',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; min-height: 55px;'
  });
  const mockBtn = helpers.createElement('button', ['btn', 'btn-secondary'], { text: 'Inject Mock Activity Data', style: 'width: 100%' });
  
  mockBtn.addEventListener('click', () => {
    if (confirm('Inject 15 mock activities into your logs database? (Your current logs will remain intact)')) {
      const mockActivities = [
        { category: 'transport', type: 'petrolCar', quantity: 30, unit: 'km', label: 'Commute to work (Petrol car)', co2: 5.1, date: new Date(Date.now() - 86400000 * 1).toISOString() },
        { category: 'food', type: 'beef', quantity: 0.3, unit: 'kg', label: 'Hamburger dinner', co2: 18.0, date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { category: 'energy', type: 'electricity', quantity: 12, unit: 'kWh', label: 'Air Conditioner running', co2: 8.6, date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { category: 'transport', type: 'busLocal', quantity: 15, unit: 'km', co2: 1.3, label: 'Local bus transit', date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { category: 'shopping', type: 'tshirt', quantity: 2, unit: 'pcs', label: 'Purchased 2 shirts', co2: 10.0, date: new Date(Date.now() - 86400000 * 4).toISOString() },
        { category: 'food', type: 'vegetarian', quantity: 1, unit: 'serving', label: 'Salad lunch (Vegetarian)', co2: 0.8, date: new Date(Date.now() - 86400000 * 5).toISOString() },
        { category: 'waste', type: 'landfillGeneral', quantity: 8, unit: 'kg', label: 'Disposed trash bags', co2: 4.6, date: new Date(Date.now() - 86400000 * 6).toISOString() },
        { category: 'transport', type: 'flightDomestic', quantity: 450, unit: 'km', label: 'Short-haul flight', co2: 110.7, date: new Date(Date.now() - 86400000 * 8).toISOString() },
        { category: 'food', type: 'poultry', quantity: 0.4, unit: 'kg', label: 'Chicken wings dinner', co2: 2.4, date: new Date(Date.now() - 86400000 * 10).toISOString() },
        { category: 'energy', type: 'electricity', quantity: 15, unit: 'kWh', label: 'Home electric heaters', co2: 10.7, date: new Date(Date.now() - 86400000 * 12).toISOString() },
        { category: 'transport', type: 'electricCar', quantity: 80, unit: 'km', label: 'Weekend travel (EV)', co2: 4.0, date: new Date(Date.now() - 86400000 * 14).toISOString() },
        { category: 'waste', type: 'composting', quantity: 6, unit: 'kg', label: 'Composted garden waste', co2: 0.6, date: new Date(Date.now() - 86400000 * 16).toISOString() },
        { category: 'shopping', type: 'smartphone', quantity: 1, unit: 'pcs', label: 'New mobile phone', co2: 70.0, date: new Date(Date.now() - 86400000 * 18).toISOString() },
        { category: 'food', type: 'vegan', quantity: 1, unit: 'serving', label: 'Tofu rice bowl (Vegan)', co2: 0.5, date: new Date(Date.now() - 86400000 * 20).toISOString() }
      ];

      mockActivities.forEach(act => {
        storage.addActivity(act);
      });

      // Unlock badges for logging
      storage.unlockBadge('eco_logger');
      storage.unlockBadge('co2_saved_10');
      storage.unlockBadge('co2_saved_50');

      toast.success('Injected mock activity database! Redirecting to Dashboard.');
      
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 1000);
    }
  });

  const mockCard = helpers.createElement('div', 'glass-card', {}, [mockCardTitle, mockCardDesc, mockBtn]);
  devActionsContainer.appendChild(mockCard);

  // Clear Database Card
  const resetCardTitle = helpers.createElement('h4', [], { text: 'Reset System', style: 'font-size:1rem; margin-bottom: 8px;' });
  const resetCardDesc = helpers.createElement('p', [], { 
    text: 'Permanently wipe your profile name, logged activities list, goals, streaks, and API key. Resets the application state to absolute default.',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; min-height: 55px;'
  });
  const resetBtn = helpers.createElement('button', ['btn', 'btn-danger'], { text: 'Delete Entire Database', style: 'width: 100%' });
  
  resetBtn.addEventListener('click', () => {
    if (confirm('CAUTION: This will delete ALL logged carbon activities, profile details, and API configuration. This cannot be undone! Continue?')) {
      storage.reset();
      toast.success('System reset successfully.');
      setTimeout(() => {
        window.location.hash = '#landing';
        window.location.reload();
      }, 1000);
    }
  });

  const resetCard = helpers.createElement('div', 'glass-card', {}, [resetCardTitle, resetCardDesc, resetBtn]);
  devActionsContainer.appendChild(resetCard);

  container.appendChild(devTitle);
  container.appendChild(devActionsContainer);

  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
