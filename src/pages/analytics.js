import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';

export function renderAnalytics() {
  const container = helpers.createElement('div', 'page analytics-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Analytics & Reports' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Analyze historic trends and compare carbon savings equivalents in detail.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  const state = storage.load();
  const activities = state.activities;
  const stats = calculations.aggregateStats(activities);

  // ------------------------------------
  // GRID: MONTHLY GRAPH & CATEGORY BARS
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // Monthly Bar Chart Card (Left)
  const chartTitle = helpers.createElement('h3', [], { text: 'Monthly Carbon History (Current Year)', style: 'margin-bottom: 20px;' });
  const barCanvas = helpers.createElement('canvas', [], { id: 'monthlyBarChart', height: '260' });
  const chartCard = helpers.createElement('div', 'glass-card', {}, [chartTitle, barCanvas]);
  mainGrid.appendChild(chartCard);

  // Category Fills Deep Dive (Right)
  const breakdownTitle = helpers.createElement('h3', [], { text: 'Carbon Distribution Deep-Dive', style: 'margin-bottom: 20px;' });
  const breakdownContainer = helpers.createElement('div', 'compare-bars');

  const categoriesList = [
    { key: 'transport', label: 'Transportation', colorClass: 'user' },
    { key: 'food', label: 'Food & Nutrition', colorClass: 'high' },
    { key: 'energy', label: 'Utility Energy', colorClass: 'target' },
    { key: 'shopping', label: 'Material Shopping', colorClass: 'user' },
    { key: 'waste', label: 'Household Waste', colorClass: 'average' }
  ];

  const totalEmissions = stats.total || 1; // avoid divide by zero

  categoriesList.forEach(cat => {
    const value = stats.categories[cat.key] || 0;
    const percentage = Math.round((value / totalEmissions) * 100);

    const labelName = helpers.createElement('span', 'compare-bar-name', { text: cat.label });
    const labelVal = helpers.createElement('span', 'compare-bar-value', { text: `${value.toFixed(1)} kg (${percentage}%)` });
    const labelsRow = helpers.createElement('div', 'compare-bar-labels', {}, [labelName, labelVal]);

    const barFill = helpers.createElement('div', ['compare-bar-fill', cat.colorClass]);
    
    // Animate width
    setTimeout(() => {
      barFill.style.width = `${percentage}%`;
    }, 100);

    const barTrack = helpers.createElement('div', 'compare-bar-track', {}, [barFill]);
    const row = helpers.createElement('div', 'compare-bar-row', {}, [labelsRow, barTrack]);
    breakdownContainer.appendChild(row);
  });

  const breakdownCard = helpers.createElement('div', 'glass-card', {}, [breakdownTitle, breakdownContainer]);
  mainGrid.appendChild(breakdownCard);
  container.appendChild(mainGrid);

  // ------------------------------------
  // SECTION: CARBON EQUIVALENTS GRID
  // ------------------------------------
  const equivalentsTitle = helpers.createElement('h3', [], { text: 'Carbon Equivalents Calculator', style: 'margin-bottom: 20px; margin-top: 24px;' });
  
  const equivGrid = helpers.createElement('div', 'grid-3');

  const equivData = [
    { title: 'Tree Absorption', icon: 'tree-pine', value: `${stats.treesEquivalent.toFixed(1)} trees`, label: 'Required to absorb this much CO₂ in one year' },
    { title: 'Petrol Driving', icon: 'car', value: `${Math.round(stats.carKmEquivalent).toLocaleString()} km`, label: 'Driven in a standard passenger gasoline car' },
    { title: 'Smartphone Charges', icon: 'smartphone', value: `${Math.round(stats.phoneChargesEquivalent).toLocaleString()}`, label: 'Full smartphone battery charges' }
  ];

  equivData.forEach(eq => {
    const eqIcon = helpers.createElement('i', [], { 'data-lucide': eq.icon, style: 'width: 24px; height: 24px; color: var(--primary-color)' });
    const eqIconWrap = helpers.createElement('div', 'stat-icon-wrapper', { style: 'background: rgba(16,185,129,0.1); margin: 0 auto 12px;' }, [eqIcon]);
    const eqVal = helpers.createElement('div', [], { text: eq.value, style: 'font-size: 1.5rem; font-weight:800; font-family: var(--font-heading); margin-bottom: 4px;' });
    const eqTitle = helpers.createElement('div', [], { text: eq.title, style: 'font-weight:600; font-size: 0.9rem; margin-bottom: 6px; color: var(--text-primary)' });
    const eqDesc = helpers.createElement('div', [], { text: eq.label, style: 'font-size: 0.75rem; color: var(--text-secondary);' });
    
    const card = helpers.createElement('div', ['glass-card'], { style: 'text-align: center; padding: 24px;' }, [
      eqIconWrap, 
      eqTitle, 
      eqVal, 
      eqDesc
    ]);
    
    equivGrid.appendChild(card);
  });

  container.appendChild(equivalentsTitle);
  container.appendChild(equivGrid);

  // ------------------------------------
  // CHARTS RENDERING LOGIC (AFTER DOM LOAD)
  // ------------------------------------
  setTimeout(() => {
    const monthlyHistory = calculations.getHistoryByMonth(activities);
    
    const barCtx = document.getElementById('monthlyBarChart')?.getContext('2d');
    if (barCtx) {
      new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(monthlyHistory),
          datasets: [{
            label: 'CO₂ emissions (kg)',
            data: Object.values(monthlyHistory),
            backgroundColor: '#06b6d4',
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748b' }
            }
          }
        }
      });
    }

    helpers.refreshIcons();
  }, 100);

  return container;
}
