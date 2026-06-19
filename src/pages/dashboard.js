import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { gemini } from '../utils/gemini.js';
import { countryAverages } from '../data/countries.js';

export function renderDashboard() {
  const container = helpers.createElement('div', 'page dashboard-page');

  const state = storage.load();
  const activities = state.activities;
  const stats = calculations.aggregateStats(activities);
  const profile = state.profile;
  const targetMonthly = state.goals.monthlyTarget; // in kg

  // ------------------------------------
  // GRID 1: STATS ROW
  // ------------------------------------
  const statsGrid = helpers.createElement('div', 'grid-3');

  // Stat 1: Total CO2 Tracked
  const co2Icon = helpers.createElement('i', [], { 'data-lucide': 'leaf' });
  const co2IconWrap = helpers.createElement('div', 'stat-icon-wrapper', { style: 'background: rgba(16,185,129,0.1); color: var(--primary-color)' }, [co2Icon]);
  const co2Value = helpers.createElement('div', 'stat-value', { text: helpers.formatCo2(stats.total) });
  const co2Label = helpers.createElement('div', 'stat-label', { text: 'Total CO₂ Tracked' });
  const co2StatInfo = helpers.createElement('div', 'stat-info', {}, [co2Value, co2Label]);
  const co2Card = helpers.createElement('div', ['glass-card', 'dash-card-stat'], {}, [co2IconWrap, co2StatInfo]);
  statsGrid.appendChild(co2Card);

  // Stat 2: Daily Average
  const avgIcon = helpers.createElement('i', [], { 'data-lucide': 'activity' });
  const avgIconWrap = helpers.createElement('div', 'stat-icon-wrapper', { style: 'background: rgba(6,182,212,0.1); color: var(--secondary-color)' }, [avgIcon]);
  const avgValue = helpers.createElement('div', 'stat-value', { text: `${stats.dailyAverage.toFixed(1)} kg` });
  const avgLabel = helpers.createElement('div', 'stat-label', { text: 'Average Daily Emissions' });
  const avgStatInfo = helpers.createElement('div', 'stat-info', {}, [avgValue, avgLabel]);
  const avgCard = helpers.createElement('div', ['glass-card', 'dash-card-stat'], {}, [avgIconWrap, avgStatInfo]);
  statsGrid.appendChild(avgCard);

  // Stat 3: Eco XP / Level
  const xpIcon = helpers.createElement('i', [], { 'data-lucide': 'zap' });
  const xpIconWrap = helpers.createElement('div', 'stat-icon-wrapper', { style: 'background: rgba(245,158,11,0.1); color: var(--accent-orange)' }, [xpIcon]);
  const xpValue = helpers.createElement('div', 'stat-value', { text: `Lvl ${profile.level}` });
  const xpLabel = helpers.createElement('div', 'stat-label', { text: `${profile.xp} XP Accumulated` });
  const xpStatInfo = helpers.createElement('div', 'stat-info', {}, [xpValue, xpLabel]);
  const xpCard = helpers.createElement('div', ['glass-card', 'dash-card-stat'], {}, [xpIconWrap, xpStatInfo]);
  statsGrid.appendChild(xpCard);

  container.appendChild(statsGrid);

  // ------------------------------------
  // GRID 2: GAUGE & AI INSIGHT ROW
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // Gauge Card (Left)
  const gaugeTitle = helpers.createElement('h3', [], { text: 'Monthly Carbon Budget', style: 'margin-bottom: 20px;' });
  
  // Calculate percentage of target used
  // Assume monthly logged total = sum of activities in the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthActivities = activities.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const currentMonthCo2 = currentMonthActivities.reduce((acc, curr) => acc + parseFloat(curr.co2), 0);
  
  const targetUsedPercent = Math.min(100, (currentMonthCo2 / targetMonthly) * 100);
  const remainingCo2 = Math.max(0, targetMonthly - currentMonthCo2);

  // Gauge SVG
  const gaugeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  gaugeSvg.setAttribute("class", "gauge-svg");
  gaugeSvg.setAttribute("viewBox", "0 0 200 200");

  // Gradient Definition
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const linearGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  linearGrad.setAttribute("id", "gauge-gradient");
  linearGrad.setAttribute("x1", "0%");
  linearGrad.setAttribute("y1", "0%");
  linearGrad.setAttribute("x2", "100%");
  linearGrad.setAttribute("y2", "100%");
  
  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#10b981");
  
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#06b6d4");
  
  linearGrad.appendChild(stop1);
  linearGrad.appendChild(stop2);
  defs.appendChild(linearGrad);
  gaugeSvg.appendChild(defs);

  // Gauge Track
  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "gauge-track");
  track.setAttribute("cx", "100");
  track.setAttribute("cy", "100");
  track.setAttribute("r", "90");
  gaugeSvg.appendChild(track);

  // Gauge Fill
  const fill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  fill.setAttribute("class", "gauge-fill");
  fill.setAttribute("cx", "100");
  fill.setAttribute("cy", "100");
  fill.setAttribute("r", "90");
  fill.setAttribute("stroke", "url(#gauge-gradient)");
  gaugeSvg.appendChild(fill);

  // Trigger Fill Animation
  setTimeout(() => {
    const strokeDashOffset = 565.48 - (565.48 * targetUsedPercent) / 100;
    fill.style.strokeDashoffset = strokeDashOffset;
  }, 100);

  const gaugeCenter = helpers.createElement('div', 'gauge-center-text', {}, [
    helpers.createElement('span', 'gauge-number', { text: `${Math.round(targetUsedPercent)}%` }),
    helpers.createElement('span', 'gauge-unit', { text: `${Math.round(currentMonthCo2)} / ${targetMonthly} kg` }),
    helpers.createElement('span', 'gauge-label', { text: targetUsedPercent > 90 ? 'Danger' : 'On Track' })
  ]);
  
  // Color code label
  if (targetUsedPercent > 90) {
    gaugeCenter.querySelector('.gauge-label').style.color = 'var(--accent-red)';
  } else if (targetUsedPercent > 70) {
    gaugeCenter.querySelector('.gauge-label').style.color = 'var(--accent-orange)';
  }

  const gaugeWrapper = helpers.createElement('div', 'carbon-gauge-wrapper', {}, [gaugeSvg, gaugeCenter]);
  
  const budgetNotes = helpers.createElement('p', [], { 
    text: `You have ${helpers.formatCo2(remainingCo2)} remaining of your monthly budget. Log your transport, home energy, and foods to stay green!`,
    style: 'font-size: 0.825rem; color: var(--text-secondary); text-align: center; margin-top: 20px;'
  });

  const gaugeCard = helpers.createElement('div', 'glass-card', {}, [gaugeTitle, gaugeWrapper, budgetNotes]);
  mainGrid.appendChild(gaugeCard);

  // AI Insight (Right)
  const insightCard = helpers.createElement('div', ['glass-card', 'insight-card']);
  const glow = helpers.createElement('div', 'insight-glow');
  const iIcon = helpers.createElement('i', 'insight-icon', { 'data-lucide': 'sparkles' });
  
  const iTitle = helpers.createElement('div', 'insight-title', { text: 'EcoBot Daily AI Insight' });
  const iDesc = helpers.createElement('div', 'insight-desc', { text: 'EcoBot is analyzing your carbon logs to generate a custom recommendation...' });
  const iText = helpers.createElement('div', 'insight-text-wrapper', {}, [iTitle, iDesc]);
  
  insightCard.appendChild(glow);
  insightCard.appendChild(iIcon);
  insightCard.appendChild(iText);
  mainGrid.appendChild(insightCard);

  // Async load Gemini advice
  gemini.getDailyAdvice().then(tip => {
    iDesc.innerHTML = tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }).catch(e => {
    iDesc.textContent = 'Choose seasonal locally sourced food ingredients to reduce global cargo shipping emissions.';
  });

  container.appendChild(mainGrid);

  // ------------------------------------
  // GRID 3: CHARTS LINE & DONUT
  // ------------------------------------
  const chartsGrid = helpers.createElement('div', 'grid-2');

  // Trend Chart Card
  const trendTitle = helpers.createElement('h3', [], { text: 'Weekly Emission Trend', style: 'margin-bottom: 20px;' });
  const trendCanvas = helpers.createElement('canvas', [], { id: 'trendChart' });
  const trendCanvasWrap = helpers.createElement('div', [], { style: 'position: relative; height: 220px; width: 100%;' }, [trendCanvas]);
  const trendCard = helpers.createElement('div', 'glass-card', {}, [trendTitle, trendCanvasWrap]);
  chartsGrid.appendChild(trendCard);

  // Category Breakdown Card
  const breakdownTitle = helpers.createElement('h3', [], { text: 'Emissions by Category', style: 'margin-bottom: 20px;' });
  const breakdownCanvas = helpers.createElement('canvas', [], { id: 'breakdownChart' });
  const breakdownCanvasWrap = helpers.createElement('div', [], { style: 'position: relative; height: 220px; width: 100%;' }, [breakdownCanvas]);
  const breakdownCard = helpers.createElement('div', 'glass-card', {}, [breakdownTitle, breakdownCanvasWrap]);
  chartsGrid.appendChild(breakdownCard);

  container.appendChild(chartsGrid);

  // ------------------------------------
  // SECTION: RECENT ACTIVITIES LOGGED
  // ------------------------------------
  const recentTitle = helpers.createElement('h3', [], { text: 'Recent Activities', style: 'margin-bottom: 20px;' });
  const logList = helpers.createElement('div', 'recent-logs-list');

  if (activities.length === 0) {
    const emptyMsg = helpers.createElement('div', [], { 
      text: 'No activities logged yet. Go to Tracker or Calculator to record your emissions!',
      style: 'color: var(--text-muted); text-align: center; padding: 40px;'
    });
    logList.appendChild(emptyMsg);
  } else {
    // Show top 5
    activities.slice(0, 5).forEach(activity => {
      const catInfo = helpers.getCategoryInfo(activity.category);
      const logIcon = helpers.createElement('i', [], { 'data-lucide': catInfo.icon, style: 'stroke: white;' });
      
      const logIconWrapper = helpers.createElement('div', 'log-icon-wrapper', {
        style: `background: linear-gradient(135deg, ${catInfo.gradient.replace('to-', '')})`
      }, [logIcon]);

      const titleEl = helpers.createElement('div', 'log-title', { text: activity.label });
      const metaEl = helpers.createElement('div', 'log-meta', { 
        text: `${helpers.formatDate(activity.date)} • ${activity.quantity} ${activity.unit || ''}`
      });
      const leftPart = helpers.createElement('div', 'log-left', {}, [
        logIconWrapper,
        helpers.createElement('div', {}, {}, [titleEl, metaEl])
      ]);

      const co2El = helpers.createElement('div', 'log-co2', { text: `+${activity.co2.toFixed(1)} kg` });
      
      const deleteIcon = helpers.createElement('i', [], { 'data-lucide': 'trash' });
      const deleteBtn = helpers.createElement('button', 'log-delete', { title: 'Delete log' }, [deleteIcon]);
      
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete the activity "${activity.label}"?`)) {
          storage.deleteActivity(activity.id);
          import('../components/toast.js').then(t => t.toast.success('Activity log removed.'));
          // Reload dashboard hash route to refresh UI
          window.location.reload();
        }
      });

      const rightPart = helpers.createElement('div', 'log-right', {}, [co2El, deleteBtn]);
      const item = helpers.createElement('div', 'log-item', {}, [leftPart, rightPart]);
      logList.appendChild(item);
    });
  }

  const recentCard = helpers.createElement('div', 'glass-card', { style: 'margin-top: 24px;' }, [recentTitle, logList]);
  container.appendChild(recentCard);

  // ------------------------------------
  // CHARTS RENDERING LOGIC (AFTER DOM LOAD)
  // ------------------------------------
  setTimeout(() => {
    // 1. Line Chart: Weekly Trend
    const history = calculations.getHistoryByDay(activities, 7);
    const labels = Object.keys(history).map(dStr => {
      const parts = dStr.split('-');
      return `${parts[2]}/${parts[1]}`; // DD/MM format
    });
    const values = Object.values(history);

    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    if (trendCtx) {
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'CO₂ emissions (kg)',
            data: values,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
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

    // 2. Donut Chart: Category Breakdown
    const breakdownCtx = document.getElementById('breakdownChart')?.getContext('2d');
    if (breakdownCtx) {
      const dataKeys = ['transport', 'food', 'energy', 'shopping', 'waste'];
      const dataLabels = ['Transportation', 'Food & Diet', 'Home Energy', 'Shopping', 'Waste'];
      const dataValues = dataKeys.map(k => stats.categories[k]);
      const dataColors = ['#3b82f6', '#f97316', '#eab308', '#ec4899', '#10b981'];

      // Check if all are zero, if so show equal segments with gray
      const isAllZero = dataValues.every(v => v === 0);

      new Chart(breakdownCtx, {
        type: 'doughnut',
        data: {
          labels: isAllZero ? ['No Data'] : dataLabels,
          datasets: [{
            data: isAllZero ? [1] : dataValues,
            backgroundColor: isAllZero ? ['rgba(255,255,255,0.05)'] : dataColors,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#94a3b8',
                font: { size: 11 }
              }
            }
          },
          cutout: '70%'
        }
      });
    }

    helpers.refreshIcons();
  }, 100);

  return container;
}
