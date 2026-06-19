import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { dailyChallenges } from '../data/challenges.js';
import { badges } from '../data/badges.js';
import { toast } from '../components/toast.js';

export function renderGoals() {
  const container = helpers.createElement('div', 'page goals-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Goals & Achievements' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Boost your green habits by completing challenges, setting custom targets, and earning badges.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  // ------------------------------------
  // GRID: CHALLENGES & TARGETS
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // Daily Challenges Panel (Left)
  const challengeSectionTitle = helpers.createElement('h3', [], { text: 'Daily Eco Challenges', style: 'margin-bottom: 20px;' });
  const challengeListEl = helpers.createElement('div', 'challenge-list');

  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = storage.getCompletedChallenges(todayStr);

  dailyChallenges.slice(0, 4).forEach(c => {
    const isCompleted = completedToday.includes(c.id);

    const catInfo = helpers.getCategoryInfo(c.category);
    const categoryIcon = helpers.createElement('i', [], { 'data-lucide': catInfo.icon, style: 'stroke: white;' });
    
    const iconWrap = helpers.createElement('div', 'challenge-category-icon', {
      style: `background: linear-gradient(135deg, ${catInfo.gradient.replace('to-', '')})`
    }, [categoryIcon]);

    const titleRow = helpers.createElement('div', 'challenge-title-row');
    const cTitle = helpers.createElement('span', 'challenge-card-title', { text: c.title });
    titleRow.appendChild(cTitle);

    const savingBadge = helpers.createElement('span', ['challenge-badge', 'challenge-badge-saving'], { text: `-${c.saving} kg CO₂` });
    const xpBadge = helpers.createElement('span', ['challenge-badge', 'challenge-badge-xp'], { text: `+${c.xp} XP` });
    titleRow.appendChild(savingBadge);
    titleRow.appendChild(xpBadge);

    const cDesc = helpers.createElement('p', 'challenge-desc', { text: c.description });
    const textBlock = helpers.createElement('div', 'challenge-text-block', {}, [titleRow, cDesc]);

    const challengeLeft = helpers.createElement('div', 'challenge-info-left', {}, [iconWrap, textBlock]);
    const challengeRight = helpers.createElement('div', 'challenge-action');

    if (isCompleted) {
      const checkIcon = helpers.createElement('i', [], { 'data-lucide': 'check-circle2', style: 'stroke: var(--primary-color)' });
      const checkedText = helpers.createElement('span', 'challenge-completed-text', { text: 'Completed' }, [checkIcon]);
      challengeRight.appendChild(checkedText);
    } else {
      const compBtn = helpers.createElement('button', ['btn', 'btn-secondary'], { 
        text: 'Complete',
        style: 'padding: 6px 14px; font-size: 0.8rem;'
      });
      
      compBtn.addEventListener('click', () => {
        const result = storage.completeChallenge(c.id, c.saving, c.xp);
        
        if (result.success) {
          toast.success(`Completed: ${c.title}! Saved ${c.saving}kg CO2 & earned ${c.xp} XP.`);
          
          // Log it as an activity too
          storage.addActivity({
            category: c.category,
            type: c.id,
            quantity: 1,
            unit: 'action',
            label: `Completed challenge: ${c.title}`,
            co2: 0 // offset logged already
          });

          // Check badges for unlocking
          const completedCount = Object.values(storage.load().completedChallenges).flat().length;
          
          if (completedCount >= 1) {
            if (storage.unlockBadge('challenge_1')) {
              toast.info("🎉 Unlocked: Challenger Badge!");
            }
          }
          if (completedCount >= 5) {
            if (storage.unlockBadge('challenge_5')) {
              toast.info("🎉 Unlocked: Habit Builder Badge!");
            }
          }

          if (result.leveledUp) {
            toast.info(`🎉 LEVEL UP! You are now Level ${result.state.profile.level}!`);
          }

          window.dispatchEvent(new Event('hashchange'));
        }
      });
      challengeRight.appendChild(compBtn);
    }

    const card = helpers.createElement('div', 'challenge-card', {}, [challengeLeft, challengeRight]);
    challengeListEl.appendChild(card);
  });

  const challengesPanel = helpers.createElement('div', 'glass-card', {}, [challengeSectionTitle, challengeListEl]);
  mainGrid.appendChild(challengesPanel);

  // Carbon Targets Panel (Right)
  const targetsTitle = helpers.createElement('h3', [], { text: 'Manage Emission Limits', style: 'margin-bottom: 20px;' });
  
  const goals = storage.getGoals();

  const budgetFormGroup = helpers.createElement('div', 'form-group');
  const budgetFormLabel = helpers.createElement('label', 'form-label', { text: 'Monthly Carbon Budget Limit (in kg CO₂):', for: 'goals-monthly-target' });
  const budgetInput = helpers.createElement('input', 'form-control', { type: 'number', min: '10', value: goals.monthlyTarget, id: 'goals-monthly-target' });
  budgetFormGroup.appendChild(budgetFormLabel);
  budgetFormGroup.appendChild(budgetInput);

  const reductionGroup = helpers.createElement('div', 'form-group');
  const reductionLabel = helpers.createElement('label', 'form-label', { text: 'Reduction Target Percentage (%):', for: 'goals-reduction-percent' });
  const reductionInput = helpers.createElement('input', 'form-control', { type: 'number', min: '1', max: '99', value: goals.reductionPercent, id: 'goals-reduction-percent' });
  reductionGroup.appendChild(reductionLabel);
  reductionGroup.appendChild(reductionInput);

  const saveTargetsBtn = helpers.createElement('button', ['btn', 'btn-primary'], { text: 'Save Targets', style: 'width: 100%; margin-top: 10px;' });
  
  saveTargetsBtn.addEventListener('click', () => {
    const valLimit = parseFloat(budgetInput.value);
    const valPercent = parseFloat(reductionInput.value);

    if (isNaN(valLimit) || valLimit < 10) {
      toast.error('Please enter a valid monthly budget limit (min 10kg).');
      return;
    }
    if (isNaN(valPercent) || valPercent < 1 || valPercent > 99) {
      toast.error('Please enter a reduction target percentage between 1% and 99%.');
      return;
    }

    storage.updateGoals({
      monthlyTarget: valLimit,
      reductionPercent: valPercent
    });

    toast.success('Your carbon goals and targets have been updated.');
  });

  const targetsCard = helpers.createElement('div', 'glass-card', { style: 'height: 100%;' }, [
    targetsTitle, 
    budgetFormGroup, 
    reductionGroup, 
    saveTargetsBtn
  ]);
  mainGrid.appendChild(targetsCard);
  container.appendChild(mainGrid);

  // ------------------------------------
  // SECTION: BADGES / ACHIEVEMENTS
  // ------------------------------------
  const badgesTitle = helpers.createElement('h3', [], { text: 'Earned Badges & Achievements', style: 'margin-bottom: 20px; margin-top: 24px;' });
  const badgeGridEl = helpers.createElement('div', 'badge-grid');

  const unlockedBadges = storage.getUnlockedBadges();

  badges.forEach(b => {
    const isUnlocked = unlockedBadges.includes(b.id);
    const bIcon = helpers.createElement('i', [], { 'data-lucide': b.icon, style: 'width: 28px; height: 28px;' });
    
    // Add colored gradient if unlocked
    const bIconWrap = helpers.createElement('div', 'badge-icon-wrapper', {
      style: isUnlocked ? `background: linear-gradient(135deg, ${b.color.replace('from-', '').replace('to-', '')})` : ''
    }, [bIcon]);

    const bTitle = helpers.createElement('div', 'badge-title', { text: b.title });
    const bDesc = helpers.createElement('div', 'badge-desc', { text: b.description });
    
    const cardClasses = ['badge-item'];
    if (isUnlocked) cardClasses.push('unlocked');
    
    const badgeCard = helpers.createElement('div', cardClasses, {
      title: isUnlocked ? 'Unlocked!' : 'Locked'
    }, [bIconWrap, bTitle, bDesc]);
    
    badgeGridEl.appendChild(badgeCard);
  });

  const badgesCard = helpers.createElement('div', 'glass-card', {}, [badgesTitle, badgeGridEl]);
  container.appendChild(badgesCard);

  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
