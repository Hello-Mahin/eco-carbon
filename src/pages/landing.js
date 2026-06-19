import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { countryAverages } from '../data/countries.js';
import { toast } from '../components/toast.js';

export function renderLanding() {
  const container = helpers.createElement('div', 'page landing-page');

  // Hero section
  const title = helpers.createElement('h1', 'landing-title', { text: 'EcoCarbon' });
  const subtitle = helpers.createElement('p', 'landing-subtitle', {
    text: 'Analyze, track, and cut your carbon emissions with smart tracking, gaming achievements, and personalized insights powered by Google Gemini AI.'
  });
  const hero = helpers.createElement('div', 'landing-hero', {}, [title, subtitle]);
  container.appendChild(hero);

  // Floating background particles (leaves)
  for (let i = 0; i < 4; i++) {
    const leaf = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    leaf.setAttribute("class", "leaf-particle");
    leaf.setAttribute("viewBox", "0 0 24 24");
    leaf.setAttribute("fill", "none");
    leaf.setAttribute("stroke", "#10b981");
    leaf.setAttribute("stroke-width", "1");
    leaf.style.left = `${Math.random() * 80 + 10}vw`;
    leaf.style.animationDelay = `${i * 3}s`;
    leaf.style.width = `${Math.random() * 20 + 20}px`;
    
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5q-1.2 3.6-4 6.5C13.5 19.5 12.3 20 11 20z");
    leaf.appendChild(p);
    
    container.appendChild(leaf);
  }

  // Onboarding Wizard Card
  const wizard = helpers.createElement('div', ['glass-panel', 'wizard-container']);
  
  // Progress Bar Header
  const progressBar = helpers.createElement('div', 'wizard-progress-bar', { style: 'width: 25%' });
  const dot1 = helpers.createElement('div', ['wizard-step-dot', 'active'], { text: '1' });
  const dot2 = helpers.createElement('div', 'wizard-step-dot', { text: '2' });
  const dot3 = helpers.createElement('div', 'wizard-step-dot', { text: '3' });
  const dot4 = helpers.createElement('div', 'wizard-step-dot', { text: '4' });
  const progressHeader = helpers.createElement('div', 'wizard-progress', {}, [progressBar, dot1, dot2, dot3, dot4]);
  wizard.appendChild(progressHeader);

  // Form State
  const formData = {
    name: '',
    country: 'in',
    dietType: 'omnivoreAverage',
    carType: 'petrolCar',
    carKm: 0,
    transitKm: 0,
    flightsDomestic: 0,
    flightsIntl: 0,
    electricityKwh: 0,
    gasKwh: 0,
    clothesPerMonth: 0,
    techPerYear: 0,
    wastePerWeek: 5,
    recyclePercent: 20,
    compostPercent: 10
  };

  // ------------------------------------
  // STEP 1: Basic Info
  // ------------------------------------
  const step1Title = helpers.createElement('h3', 'wizard-step-title', { text: 'Let\'s Get Acquainted' });
  const userIcon = helpers.createElement('i', [], { 'data-lucide': 'user' });
  step1Title.prepend(userIcon);

  const nameGroup = helpers.createElement('div', 'form-group');
  const nameLabel = helpers.createElement('label', 'form-label', { text: 'What should we call you?' });
  const nameInput = helpers.createElement('input', 'form-control', { type: 'text', placeholder: 'e.g. Jane Doe' });
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);

  const countryGroup = helpers.createElement('div', 'form-group');
  const countryLabel = helpers.createElement('label', 'form-label', { text: 'Where do you live?' });
  const countrySelect = helpers.createElement('select', 'form-select');
  countryAverages.forEach(c => {
    if (c.code !== 'world') {
      const opt = helpers.createElement('option', [], { value: c.code, text: c.name });
      if (c.code === 'in') opt.selected = true; // default India
      countrySelect.appendChild(opt);
    }
  });
  countryGroup.appendChild(countryLabel);
  countryGroup.appendChild(countrySelect);

  const step1Panel = helpers.createElement('div', ['wizard-step-panel', 'active'], {}, [step1Title, nameGroup, countryGroup]);
  wizard.appendChild(step1Panel);

  // ------------------------------------
  // STEP 2: Diet
  // ------------------------------------
  const step2Title = helpers.createElement('h3', 'wizard-step-title', { text: 'Diet & Nutrition' });
  const foodIcon = helpers.createElement('i', [], { 'data-lucide': 'utensils' });
  step2Title.prepend(foodIcon);

  const dietLabel = helpers.createElement('label', 'form-label', { text: 'Choose the diet that matches your habits:' });
  const dietCards = helpers.createElement('div', 'lifestyle-cards');
  
  const diets = [
    { type: 'vegan', name: 'Vegan', desc: 'No animal products. Lowest footprint (~2.0 kg CO2/day)' },
    { type: 'vegetarian', name: 'Vegetarian', desc: 'No meat, includes dairy/eggs (~2.5 kg CO2/day)' },
    { type: 'omnivoreAverage', name: 'Average Meat-Eater', desc: 'Eat chicken, pork, fish, occasional beef (~3.7 kg CO2/day)' },
    { type: 'omnivoreHeavyMeat', name: 'Heavy Meat-Eater', desc: 'Eat beef, pork, poultry almost daily (~5.0 kg CO2/day)' }
  ];

  diets.forEach(d => {
    const cardTitle = helpers.createElement('div', 'lifestyle-card-title', { text: d.name });
    const cardDesc = helpers.createElement('div', 'lifestyle-card-desc', { text: d.desc });
    const card = helpers.createElement('div', 'lifestyle-card', {}, [cardTitle, cardDesc]);
    if (d.type === 'omnivoreAverage') card.classList.add('selected');
    
    card.addEventListener('click', () => {
      dietCards.querySelectorAll('.lifestyle-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      formData.dietType = d.type;
    });

    dietCards.appendChild(card);
  });

  const step2Panel = helpers.createElement('div', 'wizard-step-panel', {}, [step2Title, dietLabel, dietCards]);
  wizard.appendChild(step2Panel);

  // ------------------------------------
  // STEP 3: Travel & Commute
  // ------------------------------------
  const step3Title = helpers.createElement('h3', 'wizard-step-title', { text: 'Travel & Mobility' });
  const travelIcon = helpers.createElement('i', [], { 'data-lucide': 'car' });
  step3Title.prepend(travelIcon);

  const carTypeGroup = helpers.createElement('div', 'form-group');
  const carTypeLabel = helpers.createElement('label', 'form-label', { text: 'Primary Vehicle Type (if any):' });
  const carTypeSelect = helpers.createElement('select', 'form-select');
  const carTypes = [
    { val: 'petrolCar', label: 'Petrol/Gasoline Car' },
    { val: 'dieselCar', label: 'Diesel Car' },
    { val: 'electricCar', label: 'Electric Car' },
    { val: 'motorbike', label: 'Motorbike/Scooter' },
    { val: 'bicycle', label: 'No Car / Cycle / Walk' }
  ];
  carTypes.forEach(c => {
    carTypeSelect.appendChild(helpers.createElement('option', [], { value: c.val, text: c.label }));
  });
  carTypeGroup.appendChild(carTypeLabel);
  carTypeGroup.appendChild(carTypeSelect);

  const carDistanceGroup = helpers.createElement('div', 'form-group');
  const carDistanceLabel = helpers.createElement('label', 'form-label', { text: 'Weekly distance driven (in km):' });
  const carDistanceInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '50' });
  carDistanceGroup.appendChild(carDistanceLabel);
  carDistanceGroup.appendChild(carDistanceInput);

  const transitDistanceGroup = helpers.createElement('div', 'form-group');
  const transitDistanceLabel = helpers.createElement('label', 'form-label', { text: 'Weekly public transit distance (bus/train in km):' });
  const transitDistanceInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '20' });
  transitDistanceGroup.appendChild(transitDistanceLabel);
  transitDistanceGroup.appendChild(transitDistanceInput);

  const flightGroup = helpers.createElement('div', 'grid-2');
  
  const domFlightGroup = helpers.createElement('div', 'form-group');
  const domFlightLabel = helpers.createElement('label', 'form-label', { text: 'Short flights per year (<3hr):' });
  const domFlightInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '1' });
  domFlightGroup.appendChild(domFlightLabel);
  domFlightGroup.appendChild(domFlightInput);

  const intFlightGroup = helpers.createElement('div', 'form-group');
  const intFlightLabel = helpers.createElement('label', 'form-label', { text: 'Long flights per year (>3hr):' });
  const intFlightInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '0' });
  intFlightGroup.appendChild(intFlightLabel);
  intFlightGroup.appendChild(intFlightInput);
  flightGroup.appendChild(domFlightGroup);
  flightGroup.appendChild(intFlightGroup);

  const step3Panel = helpers.createElement('div', 'wizard-step-panel', {}, [
    step3Title, 
    carTypeGroup, 
    carDistanceGroup, 
    transitDistanceGroup, 
    flightGroup
  ]);
  wizard.appendChild(step3Panel);

  // ------------------------------------
  // STEP 4: Home Energy & Consumables
  // ------------------------------------
  const step4Title = helpers.createElement('h3', 'wizard-step-title', { text: 'Home Energy & Lifestyle' });
  const energyIcon = helpers.createElement('i', [], { 'data-lucide': 'home' });
  step4Title.prepend(energyIcon);

  const elecGroup = helpers.createElement('div', 'form-group');
  const elecLabel = helpers.createElement('label', 'form-label', { text: 'Monthly electricity usage (in kWh):' });
  const elecInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '150' });
  elecGroup.appendChild(elecLabel);
  elecGroup.appendChild(elecInput);

  const shopGroup = helpers.createElement('div', 'grid-2');
  
  const clothingGroup = helpers.createElement('div', 'form-group');
  const clothingLabel = helpers.createElement('label', 'form-label', { text: 'New clothing items purchased per month:' });
  const clothingInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '2' });
  clothingGroup.appendChild(clothingLabel);
  clothingGroup.appendChild(clothingInput);

  const techGroup = helpers.createElement('div', 'form-group');
  const techLabel = helpers.createElement('label', 'form-label', { text: 'Electronic devices bought per year:' });
  const techInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '1' });
  techGroup.appendChild(techLabel);
  techGroup.appendChild(techInput);
  
  shopGroup.appendChild(clothingGroup);
  shopGroup.appendChild(techGroup);

  const step4Panel = helpers.createElement('div', 'wizard-step-panel', {}, [step4Title, elecGroup, shopGroup]);
  wizard.appendChild(step4Panel);

  // ------------------------------------
  // NAVIGATION ACTIONS
  // ------------------------------------
  let currentStep = 1;
  const panels = [step1Panel, step2Panel, step3Panel, step4Panel];
  const dots = [dot1, dot2, dot3, dot4];

  const prevBtn = helpers.createElement('button', 'btn-secondary', { text: 'Back', style: 'visibility: hidden;' });
  const nextBtn = helpers.createElement('button', 'btn-primary', { text: 'Next Step' });
  const actionsRow = helpers.createElement('div', 'wizard-actions', {}, [prevBtn, nextBtn]);
  wizard.appendChild(actionsRow);

  container.appendChild(wizard);

  // Event handlers
  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      dots[currentStep - 1].classList.remove('active');
      panels[currentStep - 1].classList.remove('active');
      currentStep--;
      panels[currentStep - 1].classList.add('active');
      dots[currentStep - 1].classList.add('active');
      dots[currentStep - 1].classList.remove('completed');
      
      updateWizardUI();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep === 1) {
      // Validate name
      if (!nameInput.value.trim()) {
        toast.error('Please enter your name to proceed.');
        return;
      }
      formData.name = nameInput.value.trim();
      formData.country = countrySelect.value;
    }

    if (currentStep < 4) {
      dots[currentStep - 1].classList.remove('active');
      dots[currentStep - 1].classList.add('completed');
      panels[currentStep - 1].classList.remove('active');
      currentStep++;
      panels[currentStep - 1].classList.add('active');
      dots[currentStep - 1].classList.add('active');
      
      updateWizardUI();
    } else {
      // Step 4 final submission
      formData.carType = carTypeSelect.value;
      formData.carKm = parseFloat(carDistanceInput.value || 0);
      formData.transitKm = parseFloat(transitDistanceInput.value || 0);
      formData.flightsDomestic = parseFloat(domFlightInput.value || 0);
      formData.flightsIntl = parseFloat(intFlightInput.value || 0);
      formData.electricityKwh = parseFloat(elecInput.value || 0);
      formData.clothesPerMonth = parseFloat(clothingInput.value || 0);
      formData.techPerYear = parseFloat(techInput.value || 0);

      completeOnboarding();
    }
  });

  function updateWizardUI() {
    // Show/hide back button
    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    // Change next button text on final step
    nextBtn.textContent = currentStep === 4 ? 'Calculate Footprint' : 'Next Step';
    
    // Update progress bar width
    progressBar.style.width = `${((currentStep - 1) / 3) * 100}%`;
  }

  function completeOnboarding() {
    // Math to get initial baseline
    const baseline = calculations.calculateBaseline(formData);
    
    // Save to storage
    storage.updateProfile({
      name: formData.name,
      country: formData.country,
      lifestyle: formData.dietType,
      baselineCo2: baseline,
      onboarded: true,
      xp: 100 // initial bonus!
    });

    storage.unlockBadge('first_step');

    toast.success(`Welcome aboard ${formData.name}! Your baseline carbon footprint is calculated.`);

    // Animate complete and redirect
    wizard.innerHTML = `
      <div style="text-align: center; padding: 20px;" class="animate-fade-in">
        <i data-lucide="globe-2" style="width: 70px; height: 70px; stroke: var(--primary-color); margin-bottom: 20px; filter: drop-shadow(0 0 10px var(--primary-glow));"></i>
        <h3 style="font-size: 1.8rem; margin-bottom: 12px; font-family: var(--font-heading);">Baseline Footprint Calculated!</h3>
        <p style="color: var(--text-secondary); font-size: 1rem; max-width: 450px; margin: 0 auto 24px;">
          Your lifestyle emissions average out to:
        </p>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; display: inline-block; margin-bottom: 30px;">
          <span style="font-size: 3rem; font-weight: 800; font-family: var(--font-heading); color: var(--primary-color); display: block; line-height: 1;">
            ${baseline.toFixed(2)}
          </span>
          <span style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">
            tonnes CO₂e per year
          </span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 420px; margin: 0 auto 30px;">
          Let's head over to your Dashboard. Start logging activities to reduce this baseline and earn points!
        </p>
        <button id="go-dashboard-btn" class="btn btn-primary" style="padding: 12px 30px; font-size: 1rem;">Go to Dashboard</button>
      </div>
    `;

    helpers.refreshIcons();

    document.getElementById('go-dashboard-btn').addEventListener('click', () => {
      // Trigger navigation
      window.location.hash = '#dashboard';
    });
  }

  // Trigger immediate Lucide render
  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
