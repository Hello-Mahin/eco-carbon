import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { countryAverages, targets } from '../data/countries.js';

export function renderCompare() {
  const container = helpers.createElement('div', 'page compare-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Global Rankings' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Compare your carbon emissions with world statistics and local community benchmarks.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  const state = storage.load();
  const profile = state.profile;
  const stats = calculations.aggregateStats(state.activities);

  // Extrapolate annual footprint in tonnes:
  // If user has zero logged activities, fallback to baseline.
  // Otherwise, use: (dailyAverage * 365) / 1000.
  let myAnnualFootprint = profile.baselineCo2;
  if (state.activities.length > 0) {
    myAnnualFootprint = (stats.dailyAverage * 365) / 1000;
  }

  // ------------------------------------
  // GRID: BARS & LEADERBOARD
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // Comparison Bars Card (Left)
  const compareTitle = helpers.createElement('h3', [], { text: 'Annual Emissions Comparison (Tonnes CO₂)', style: 'margin-bottom: 24px;' });
  const barsContainer = helpers.createElement('div', 'compare-bars');

  // Construct comparison list
  const compList = [
    { name: `You (${profile.name})`, value: myAnnualFootprint, isUser: true, colorClass: 'user' },
    { name: 'Paris Agreement Target', value: targets.parisAgreement, isUser: false, colorClass: 'target' },
    { name: 'India Average', value: 2.0, isUser: false, colorClass: 'average' },
    { name: 'World Average', value: 4.7, isUser: false, colorClass: 'average' },
    { name: 'China Average', value: 9.1, isUser: false, colorClass: 'high' },
    { name: 'United States Average', value: 14.0, isUser: false, colorClass: 'high' }
  ];

  // Find max value to calibrate bar scale widths
  const maxVal = Math.max(...compList.map(c => c.value)) || 1;

  compList.forEach(item => {
    const percentage = Math.round((item.value / maxVal) * 100);

    const labelName = helpers.createElement('span', 'compare-bar-name', { text: item.name });
    if (item.isUser) { labelName.style.fontWeight = 'bold'; }
    
    const labelVal = helpers.createElement('span', 'compare-bar-value', { text: `${item.value.toFixed(2)} tonnes` });
    const labelsRow = helpers.createElement('div', 'compare-bar-labels', {}, [labelName, labelVal]);

    const barFill = helpers.createElement('div', ['compare-bar-fill', item.colorClass]);
    
    // Animate width
    setTimeout(() => {
      barFill.style.width = `${percentage}%`;
    }, 100);

    const barTrack = helpers.createElement('div', 'compare-bar-track', {}, [barFill]);
    const row = helpers.createElement('div', 'compare-bar-row', {}, [labelsRow, barTrack]);
    barsContainer.appendChild(row);
  });

  const compareCard = helpers.createElement('div', 'glass-card', {}, [compareTitle, barsContainer]);
  mainGrid.appendChild(compareCard);

  // Leaderboard Card (Right)
  const leadTitle = helpers.createElement('h3', [], { text: 'Community Leaderboard', style: 'margin-bottom: 8px;' });
  const leadDesc = helpers.createElement('p', [], { 
    text: 'Rankings are based on daily average emissions logged in the past 7 days (Lower is better!).',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;'
  });

  const leadList = helpers.createElement('div', 'leaderboard-list');

  // Pre-compiled list of fake users
  const communityUsers = [
    { rank: 1, name: 'Aarav Sharma', co2: 1.1, badge: 'Eco Deity' },
    { rank: 2, name: 'Priya Patel', co2: 1.8, badge: 'Forest Friend' },
    { rank: 3, name: 'Rohan Gupta', co2: 2.3, badge: 'Carbon Cutter' },
    { rank: 4, name: 'Ananya Iyer', co2: 2.8, badge: 'Eco Warrior' },
    { rank: 5, name: 'Vikram Singh', co2: 3.5, badge: 'Seedling' }
  ];

  // Insert user dynamically in the leaderboard based on their carbon score
  const myDailyAverage = stats.dailyAverage || (profile.baselineCo2 * 1000 / 365);
  let userInserted = false;
  let rankIndex = 1;

  for (let i = 0; i < communityUsers.length; i++) {
    const otherUser = communityUsers[i];
    
    if (myDailyAverage < otherUser.co2 && !userInserted) {
      // User beats this competitor! Insert user here
      leadList.appendChild(renderLeaderboardRow(rankIndex, `${profile.name} (You)`, myDailyAverage, 'Your Level', true));
      rankIndex++;
      userInserted = true;
    }
    
    // Render competitor
    leadList.appendChild(renderLeaderboardRow(rankIndex, otherUser.name, otherUser.co2, otherUser.badge, false));
    rankIndex++;
  }

  // If user wasn't low enough carbon to beat anyone, insert at the end
  if (!userInserted) {
    leadList.appendChild(renderLeaderboardRow(rankIndex, `${profile.name} (You)`, myDailyAverage, 'Your Level', true));
  }

  function renderLeaderboardRow(rank, name, co2Val, badgeText, isMe) {
    const rankEl = helpers.createElement('span', ['leaderboard-rank', `top-${rank}`], { text: `#${rank}` });
    
    const nameEl = helpers.createElement('span', 'leaderboard-name', { text: name });
    const badgeEl = helpers.createElement('span', 'leaderboard-badge', { text: badgeText });
    const nameBlock = helpers.createElement('div', {}, {}, [nameEl, badgeEl]);

    const leftPart = helpers.createElement('div', 'leaderboard-left', {}, [rankEl, nameBlock]);
    const rightPart = helpers.createElement('div', 'leaderboard-co2', { text: `${co2Val.toFixed(1)} kg/day` });

    const classes = ['leaderboard-item'];
    if (isMe) { classes.push('me'); }

    return helpers.createElement('div', classes, {}, [leftPart, rightPart]);
  }

  const leadCard = helpers.createElement('div', 'glass-card', {}, [leadTitle, leadDesc, leadList]);
  mainGrid.appendChild(leadCard);
  container.appendChild(mainGrid);

  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
