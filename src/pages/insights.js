import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { gemini } from '../utils/gemini.js';
import { toast } from '../components/toast.js';

export function renderInsights() {
  const container = helpers.createElement('div', 'page insights-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'AI Insights & Strategy' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'EcoBot leverages Google Gemini AI models to analyze your lifestyle footprint and outline a clear road to carbon neutrality.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  // ------------------------------------
  // GRID: WHAT-IF SIMULATOR & PLAN AREA
  // ------------------------------------
  const mainGrid = helpers.createElement('div', 'grid-2');

  // Simulator Card (Left)
  const simTitle = helpers.createElement('h3', [], { text: 'What-If Impact Simulator', style: 'margin-bottom: 8px;' });
  const simDesc = helpers.createElement('p', [], { 
    text: 'Drag the toggles to see the potential carbon footprint reduction and savings equivalents.',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 24px;'
  });

  // Slider 1: Food Swap (Beef to Veg)
  const meatSliderGroup = helpers.createElement('div', 'form-group');
  const meatSliderLabel = helpers.createElement('label', 'form-label', { text: 'Reduce Beef/Meat consumption by:', for: 'insights-meat-slider' });
  const meatValueLabel = helpers.createElement('span', [], { text: ' 0 kg/week', style: 'font-weight:600; color:var(--primary-color);' });
  meatSliderLabel.appendChild(meatValueLabel);
  const meatSlider = helpers.createElement('input', 'form-control', { type: 'range', min: '0', max: '5', step: '0.5', value: '0', id: 'insights-meat-slider' });
  meatSliderGroup.appendChild(meatSliderLabel);
  meatSliderGroup.appendChild(meatSlider);

  // Slider 2: Driving to Transit Swap
  const carSliderGroup = helpers.createElement('div', 'form-group');
  const carSliderLabel = helpers.createElement('label', 'form-label', { text: 'Swap Car driving with Public Transit/Cycling:', for: 'insights-car-slider' });
  const carValueLabel = helpers.createElement('span', [], { text: ' 0 km/week', style: 'font-weight:600; color:var(--primary-color);' });
  carSliderLabel.appendChild(carValueLabel);
  const carSlider = helpers.createElement('input', 'form-control', { type: 'range', min: '0', max: '200', step: '10', value: '0', id: 'insights-car-slider' });
  carSliderGroup.appendChild(carSliderLabel);
  carSliderGroup.appendChild(carSlider);

  // Slider 3: Renewable Electricity Solar Panel installation
  const solarGroup = helpers.createElement('div', 'form-group');
  const solarLabel = helpers.createElement('label', 'form-label', { text: 'Switch home energy source to solar:', for: 'insights-solar-slider' });
  const solarValueLabel = helpers.createElement('span', [], { text: ' 0% solar power', style: 'font-weight:600; color:var(--primary-color);' });
  solarLabel.appendChild(solarValueLabel);
  const solarSlider = helpers.createElement('input', 'form-control', { type: 'range', min: '0', max: '100', step: '10', value: '0', id: 'insights-solar-slider' });
  solarGroup.appendChild(solarLabel);
  solarGroup.appendChild(solarSlider);

  // Simulator Results Display
  const simResultCo2Val = helpers.createElement('span', [], { text: '0.0 kg', style: 'font-size: 2.25rem; font-weight:800; font-family: var(--font-heading); color: var(--primary-color); line-height: 1;' });
  const simResultEquivalent = helpers.createElement('p', [], { text: 'Equates to planting 0 trees per year.', style: 'font-size: 0.825rem; color: var(--text-secondary); margin-top: 6px;' });
  const simResultsBox = helpers.createElement('div', [], { 
    style: 'margin-top: 24px; padding: 20px; border-radius: var(--radius-md); border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.02); text-align: center;' 
  }, [
    helpers.createElement('h4', [], { text: 'Potential Annual Savings', style: 'font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;' }),
    simResultCo2Val,
    simResultEquivalent
  ]);

  const simulatorCard = helpers.createElement('div', 'glass-card', {}, [
    simTitle,
    simDesc,
    meatSliderGroup,
    carSliderGroup,
    solarGroup,
    simResultsBox
  ]);
  mainGrid.appendChild(simulatorCard);

  // AI Reduction Strategy Card (Right)
  const strategyTitle = helpers.createElement('h3', [], { text: 'Personalized AI Reduction Strategy' });
  const strategyContainer = helpers.createElement('div', 'insights-plan-content', { style: 'margin-top: 20px;' });
  
  // Shimmer Loader Placeholder
  const shimmer1 = helpers.createElement('div', ['shimmer'], { style: 'height: 16px; width: 100%; border-radius: 4px; margin-bottom: 12px;' });
  const shimmer2 = helpers.createElement('div', ['shimmer'], { style: 'height: 16px; width: 90%; border-radius: 4px; margin-bottom: 12px;' });
  const shimmer3 = helpers.createElement('div', ['shimmer'], { style: 'height: 16px; width: 95%; border-radius: 4px; margin-bottom: 12px;' });
  const shimmer4 = helpers.createElement('div', ['shimmer'], { style: 'height: 100px; width: 100%; border-radius: 8px; margin-bottom: 12px;' });
  const shimmerContainer = helpers.createElement('div', [], {}, [shimmer1, shimmer2, shimmer3, shimmer4]);
  
  const strategyCard = helpers.createElement('div', 'glass-card', {}, [
    strategyTitle, 
    shimmerContainer, 
    strategyContainer
  ]);
  mainGrid.appendChild(strategyCard);
  container.appendChild(mainGrid);

  // ------------------------------------
  // SIMULATOR UPDATE LOGIC
  // ------------------------------------
  function updateSimulator() {
    const meatVal = parseFloat(meatSlider.value);
    const carVal = parseFloat(carSlider.value);
    const solarVal = parseFloat(solarSlider.value);

    // Update labels
    meatValueLabel.textContent = ` ${meatVal} kg/week`;
    carValueLabel.textContent = ` ${carVal} km/week`;
    solarValueLabel.textContent = ` ${solarVal}% solar`;

    // Math conversions (Annual savings in kg CO2)
    // 1. Meat swap: meatVal * 52 weeks * beef saving factor (beef 60 - chicken 6 = 54 saving)
    const foodSavings = meatVal * 52 * 54;
    
    // 2. Transport swap: carVal * 52 weeks * difference between petrol car (0.170) and bus (0.089) = 0.081 saving
    const transportSavings = carVal * 52 * 0.081;

    // 3. Solar energy: assume average home grid emissions = 1200kWh * grid emission factor.
    // Switching solar saves: (solarVal / 100) * 1200kWh * 0.716 (India grid factor)
    const energySavings = (solarVal / 100) * 1200 * 0.716;

    const totalAnnualSavings = foodSavings + transportSavings + energySavings;
    const treesPlantOffset = totalAnnualSavings / 22; // 1 tree = 22 kg CO2

    simResultCo2Val.textContent = helpers.formatCo2Saving(totalAnnualSavings);
    simResultEquivalent.textContent = `Equivalent to planting ${Math.round(treesPlantOffset)} mature trees per year!`;
  }

  meatSlider.addEventListener('input', updateSimulator);
  carSlider.addEventListener('input', updateSimulator);
  solarSlider.addEventListener('input', updateSimulator);
  
  // Initial run
  updateSimulator();

  // ------------------------------------
  // ASYNC GENERATE GEMINI STRATEGY
  // ------------------------------------
  gemini.generatePersonalizedPlan().then(markdownPlan => {
    // Hide loading shimmers
    shimmerContainer.style.display = 'none';

    // Format markdown beautifully (bullet lists, strong elements, headings, etc.)
    let htmlContent = markdownPlan
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/\n\s*\*\s*(.*?)/g, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>') // wrap
      .replace(/\n/g, '<br>');

    // Clean double ul tags
    htmlContent = htmlContent.replace(/<\/ul><br><ul>/g, '').replace(/<\/ul><ul>/g, '');

    strategyContainer.innerHTML = htmlContent;
  }).catch(err => {
    shimmerContainer.style.display = 'none';
    strategyContainer.textContent = "AI Generation failed. Check your API configuration in Profile.";
  });

  // ------------------------------------
  // SECTION: CARBON OFFSET SUGGESTIONS
  // ------------------------------------
  const offsetTitle = helpers.createElement('h3', [], { text: 'Verified Carbon Offsetting Suggestions', style: 'margin-bottom: 8px; margin-top: 24px;' });
  const offsetDesc = helpers.createElement('p', [], {
    text: 'For carbon emissions you cannot avoid, consider supporting these verified gold-standard offset initiatives.',
    style: 'font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;'
  });

  const offsetGrid = helpers.createElement('div', 'grid-3');

  const offsetProjects = [
    {
      title: 'Gold Standard Projects',
      desc: 'Support certified wind, solar, clean water, and community development projects worldwide with verifiable carbon credits.',
      linkText: 'Support Gold Standard',
      url: 'https://www.goldstandard.org/',
      icon: 'globe'
    },
    {
      title: 'TeamTrees Reforestation',
      desc: 'Every dollar donated plants a native tree in a critical forest ecosystem to rebuild wildlife habitats and capture CO₂.',
      linkText: 'Plant Trees with TeamTrees',
      url: 'https://teamtrees.org/',
      icon: 'tree-pine'
    },
    {
      title: 'Climeworks Carbon Removal',
      desc: 'Fund direct air capture technology that filters carbon dioxide directly out of ambient air and stores it safely underground.',
      linkText: 'Explore Climeworks',
      url: 'https://climeworks.com/',
      icon: 'wind'
    }
  ];

  offsetProjects.forEach(p => {
    const pIcon = helpers.createElement('i', [], { 'data-lucide': p.icon, style: 'width: 24px; height: 24px; color: var(--primary-color)' });
    const pIconWrap = helpers.createElement('div', 'stat-icon-wrapper', { style: 'background: rgba(16,185,129,0.1); margin: 0 auto 12px;' }, [pIcon]);
    
    const pTitle = helpers.createElement('div', [], { text: p.title, style: 'font-weight: 600; font-size: 1rem; margin-bottom: 8px; color: var(--text-primary)' });
    const pDesc = helpers.createElement('div', [], { text: p.desc, style: 'font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px; min-height: 60px;' });
    
    const pLink = helpers.createElement('a', ['btn', 'btn-secondary'], { 
      href: p.url, 
      target: '_blank', 
      rel: 'noopener noreferrer', 
      text: p.linkText,
      style: 'display: block; text-align: center; font-size: 0.8rem; padding: 8px 0; border-radius: var(--radius-sm); border: 1px solid var(--border-color);'
    });
    
    const card = helpers.createElement('div', 'glass-card', { style: 'text-align: center; padding: 24px;' }, [
      pIconWrap,
      pTitle,
      pDesc,
      pLink
    ]);
    offsetGrid.appendChild(card);
  });

  const offsetSection = helpers.createElement('div', {}, {}, [offsetTitle, offsetDesc, offsetGrid]);
  container.appendChild(offsetSection);

  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
