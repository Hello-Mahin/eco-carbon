import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { toast } from '../components/toast.js';

export function renderTracker() {
  const container = helpers.createElement('div', 'page tracker-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Activity Tracker' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Log your lifestyle choices daily and visualize your emission habits over time.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  // ------------------------------------
  // SECTION 1: QUICK LOG ACTIONS
  // ------------------------------------
  const quickSectionTitle = helpers.createElement('h3', [], { text: 'Quick Log Choices', style: 'margin-bottom: 16px;' });
  const quickActionsGrid = helpers.createElement('div', 'quick-log-grid');

  const quickTemplates = [
    { label: 'Vegetarian Meal', category: 'food', type: 'vegetarian', qty: 1, unit: 'serving', co2: 0.8, actionLabel: 'Ate Veg Meal' },
    { label: 'Vegan Meal', category: 'food', type: 'vegan', qty: 1, unit: 'serving', co2: 0.5, actionLabel: 'Ate Vegan Meal' },
    { label: 'Chicken Meal', category: 'food', type: 'poultry', qty: 0.25, unit: 'kg', co2: 1.5, actionLabel: 'Ate Chicken Meal' },
    { label: 'Beef Burger', category: 'food', type: 'beef', qty: 0.2, unit: 'kg', co2: 12.0, actionLabel: 'Ate Beef Burger' },
    { label: 'Walk / Cycle', category: 'transport', type: 'bicycle', qty: 5, unit: 'km', co2: 0.0, actionLabel: 'Walked / Cycled 5km' },
    { label: 'Bus Ride', category: 'transport', type: 'busLocal', qty: 10, unit: 'km', co2: 0.89, actionLabel: 'Bus Ride 10km' },
    { label: 'Short Car Drive', category: 'transport', type: 'petrolCar', qty: 15, unit: 'km', co2: 2.55, actionLabel: 'Drove Car 15km' },
    { label: 'Recycled waste', category: 'waste', type: 'recyclingAverage', qty: 5, unit: 'kg', co2: 0.1, actionLabel: 'Recycled 5kg waste' }
  ];

  quickTemplates.forEach(t => {
    const catInfo = helpers.getCategoryInfo(t.category);
    const qIcon = helpers.createElement('i', [], { 'data-lucide': catInfo.icon, style: `color: ${catInfo.color.replace('text-', '')}` });
    const qText = helpers.createElement('span', 'quick-log-label', { text: t.label });
    const btn = helpers.createElement('button', 'quick-log-btn', {}, [qIcon, qText]);
    
    btn.addEventListener('click', () => {
      storage.addActivity({
        category: t.category,
        type: t.type,
        quantity: t.qty,
        unit: t.unit,
        label: t.actionLabel,
        co2: t.co2
      });

      // Add XP
      const levelCheck = storage.addXP(15);
      toast.success(`Logged: ${t.actionLabel} (+${t.co2} kg CO₂)`);
      
      // Unlock badge if they did 5 vegan meals
      const act = storage.getActivities();
      const veganMealsCount = act.filter(a => a.type === 'vegan').length;
      if (veganMealsCount >= 5) {
        if (storage.unlockBadge('vegan_badge')) {
          toast.info("🎉 Unlocked: Plant Powered Badge!");
        }
      }

      if (levelCheck.leveledUp) {
        toast.info(`🎉 LEVEL UP! You are now Level ${levelCheck.profile.level}!`);
      }

      // Reload view smoothly without hard page refresh
      window.dispatchEvent(new Event('hashchange'));
    });

    quickActionsGrid.appendChild(btn);
  });

  const quickSection = helpers.createElement('div', 'glass-card', { style: 'margin-bottom: 24px;' }, [quickSectionTitle, quickActionsGrid]);
  container.appendChild(quickSection);

  // ------------------------------------
  // SECTION 2: CALENDAR HEATMAP & HISTORY
  // ------------------------------------
  const bottomLayout = helpers.createElement('div', 'grid-2');

  // Calendar Heatmap Card
  const mapTitle = helpers.createElement('h3', [], { text: 'Activity Intensity Heatmap', style: 'margin-bottom: 6px;' });
  const mapDesc = helpers.createElement('p', [], { 
    text: 'Colors show carbon footprint intensity: Green (Safe), Orange/Red (High emissions).',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;'
  });
  
  const mapGrid = helpers.createElement('div', 'heatmap-calendar');
  
  // Render calendar grid of last 28 days
  const today = new Date();
  const activities = storage.getActivities();
  const historyDays = calculations.getHistoryByDay(activities, 28);
  
  Object.entries(historyDays).forEach(([dateStr, co2Val]) => {
    let intensityClass = 'heatmap-day-zero';
    if (co2Val > 0) {
      if (co2Val < 5) intensityClass = 'heatmap-day-low';
      else if (co2Val < 15) intensityClass = 'heatmap-day-medium';
      else if (co2Val < 30) intensityClass = 'heatmap-day-high';
      else intensityClass = 'heatmap-day-veryhigh';
    }

    const dayEl = helpers.createElement('div', ['heatmap-day', intensityClass], {
      title: `${helpers.formatDate(dateStr)}: ${co2Val.toFixed(1)} kg CO₂e`
    });
    
    mapGrid.appendChild(dayEl);
  });

  const mapCard = helpers.createElement('div', 'glass-card', {}, [mapTitle, mapDesc, mapGrid]);
  bottomLayout.appendChild(mapCard);

  // Activity History List Card
  const listTitle = helpers.createElement('h3', [], { text: 'Logged History', style: 'margin-bottom: 16px;' });
  
  // Filter Row
  const filters = ['all', 'transport', 'food', 'energy', 'shopping', 'waste'];
  const filterRow = helpers.createElement('div', [], { style: 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;' });
  
  let activeFilter = 'all';
  const filterBtns = [];

  filters.forEach(f => {
    const fBtn = helpers.createElement('button', 'btn-secondary', { 
      text: f.charAt(0).toUpperCase() + f.slice(1),
      style: 'padding: 4px 12px; font-size: 0.8rem; border-radius: 20px;'
    });
    if (f === activeFilter) fBtn.style.borderColor = 'var(--primary-color)';
    
    fBtn.addEventListener('click', () => {
      activeFilter = f;
      filterBtns.forEach(btn => btn.style.borderColor = '');
      fBtn.style.borderColor = 'var(--primary-color)';
      renderHistoryItems();
    });

    filterRow.appendChild(fBtn);
    filterBtns.push(fBtn);
  });

  const historyItemsContainer = helpers.createElement('div', 'recent-logs-list', { style: 'max-height: 250px;' });
  
  function renderHistoryItems() {
    historyItemsContainer.innerHTML = '';
    
    let list = activities;
    if (activeFilter !== 'all') {
      list = activities.filter(a => a.category === activeFilter);
    }

    if (list.length === 0) {
      historyItemsContainer.appendChild(helpers.createElement('div', [], { 
        text: 'No logs match this filter.',
        style: 'color: var(--text-muted); text-align: center; padding: 20px;'
      }));
      return;
    }

    list.forEach(a => {
      const catInfo = helpers.getCategoryInfo(a.category);
      const logIcon = helpers.createElement('i', [], { 'data-lucide': catInfo.icon, style: 'stroke: white;' });
      
      const logIconWrapper = helpers.createElement('div', 'log-icon-wrapper', {
        style: `background: linear-gradient(135deg, ${catInfo.gradient.replace('to-', '')})`
      }, [logIcon]);

      const titleEl = helpers.createElement('div', 'log-title', { text: a.label });
      const metaEl = helpers.createElement('div', 'log-meta', { 
        text: `${helpers.formatDate(a.date)} • ${a.quantity} ${a.unit || ''}`
      });
      const leftPart = helpers.createElement('div', 'log-left', {}, [
        logIconWrapper,
        helpers.createElement('div', {}, {}, [titleEl, metaEl])
      ]);

      const co2El = helpers.createElement('div', 'log-co2', { text: `+${a.co2.toFixed(1)} kg` });
      
      const deleteIcon = helpers.createElement('i', [], { 'data-lucide': 'trash' });
      const deleteBtn = helpers.createElement('button', 'log-delete', { title: 'Delete log', 'aria-label': 'Delete activity log' }, [deleteIcon]);
      
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete the activity "${a.label}"?`)) {
          storage.deleteActivity(a.id);
          toast.success('Activity log removed.');
          window.dispatchEvent(new Event('hashchange'));
        }
      });

      const rightPart = helpers.createElement('div', 'log-right', {}, [co2El, deleteBtn]);
      const item = helpers.createElement('div', 'log-item', {}, [leftPart, rightPart]);
      historyItemsContainer.appendChild(item);
    });
    
    helpers.refreshIcons();
  }

  const historyCard = helpers.createElement('div', 'glass-card', {}, [listTitle, filterRow, historyItemsContainer]);
  bottomLayout.appendChild(historyCard);
  container.appendChild(bottomLayout);

  // Initial list render
  renderHistoryItems();

  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
