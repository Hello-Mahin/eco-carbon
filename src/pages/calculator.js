import { helpers } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';
import { calculations } from '../utils/calculations.js';
import { toast } from '../components/toast.js';

export function renderCalculator() {
  const container = helpers.createElement('div', 'page calculator-page');

  // Page Header
  const title = helpers.createElement('h2', 'page-title', { text: 'Carbon Calculator' });
  const desc = helpers.createElement('p', 'page-desc', { text: 'Measure specific events or habits in detail to see their immediate carbon impact.' });
  const header = helpers.createElement('div', 'page-header', {}, [title, desc]);
  container.appendChild(header);

  // Tabs Header
  const tabConfig = [
    { id: 'tab-transport', label: 'Commuting', icon: 'car' },
    { id: 'tab-food', label: 'Food & Meals', icon: 'beef' },
    { id: 'tab-energy', label: 'Home Energy', icon: 'zap' },
    { id: 'tab-shopping', label: 'Purchases', icon: 'shopping-bag' },
    { id: 'tab-waste', label: 'Garbage & Waste', icon: 'trash-2' }
  ];

  const tabsHeader = helpers.createElement('div', 'calc-card-options');
  tabConfig.forEach((tab, index) => {
    const tIcon = helpers.createElement('i', 'calc-card-icon', { 'data-lucide': tab.icon });
    const tTitle = helpers.createElement('div', 'calc-card-title', { text: tab.label });
    const tabEl = helpers.createElement('div', 'calc-card-option', { 
      'data-tab': tab.id,
      role: 'tab',
      tabindex: '0',
      'aria-selected': index === 0 ? 'true' : 'false',
      'aria-label': `Show ${tab.label} calculator`
    }, [tIcon, tTitle]);
    if (index === 0) { tabEl.classList.add('selected'); }
    tabsHeader.appendChild(tabEl);
  });
  container.appendChild(tabsHeader);

  // Results Side Panel Scaffolding
  const resultDisplayVal = helpers.createElement('span', [], { text: '0.0', style: 'font-size: 3rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-red); line-height:1;' });
  const resultUnit = helpers.createElement('span', [], { text: ' kg CO₂e', style: 'font-size: 1.2rem; color: var(--text-secondary); font-weight: 600;' });
  const resultEquivalent = helpers.createElement('p', [], { text: 'Equivalent to 0 smartphone charges.', style: 'font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;' });
  const logBtn = helpers.createElement('button', ['btn', 'btn-primary'], { text: 'Log Activity', style: 'margin-top: 20px; width: 100%;' });
  const resultPanel = helpers.createElement('div', ['glass-card'], { style: 'text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;' }, [
    helpers.createElement('h3', [], { text: 'Calculated Footprint', style: 'font-size: 1.1rem; margin-bottom: 12px; color: var(--text-secondary);' }),
    helpers.createElement('div', {}, {}, [resultDisplayVal, resultUnit]),
    resultEquivalent,
    logBtn
  ]);

  const mainLayout = helpers.createElement('div', 'grid-2');
  const formsContainer = helpers.createElement('div');
  mainLayout.appendChild(formsContainer);
  mainLayout.appendChild(resultPanel);
  container.appendChild(mainLayout);

  let currentCategory = 'transport';
  let calculatedCo2 = 0;
  let logPayload = {};

  // ------------------------------------
  // FORM 1: TRANSPORT
  // ------------------------------------
  const fTrans = helpers.createElement('div', ['calc-step-panel', 'active']);
  
  const transTypeGroup = helpers.createElement('div', 'form-group');
  const transTypeLabel = helpers.createElement('label', 'form-label', { text: 'Vehicle Type:', for: 'calc-trans-type' });
  const transTypeSelect = helpers.createElement('select', 'form-select', { id: 'calc-trans-type' });
  const vehicleOptions = [
    { val: 'petrolCar', label: 'Petrol Car (Single Occupant)' },
    { val: 'dieselCar', label: 'Diesel Car (Single Occupant)' },
    { val: 'electricCar', label: 'Electric Car' },
    { val: 'busLocal', label: 'Local Bus Journey' },
    { val: 'trainNational', label: 'National Rail Train' },
    { val: 'flightDomestic', label: 'Domestic Flight (<500km)' },
    { val: 'flightShort', label: 'Short-haul Flight (<3500km)' },
    { val: 'flightLong', label: 'Long-haul Flight (>3500km)' }
  ];
  vehicleOptions.forEach(opt => {
    transTypeSelect.appendChild(helpers.createElement('option', [], { value: opt.val, text: opt.label }));
  });
  transTypeGroup.appendChild(transTypeLabel);
  transTypeGroup.appendChild(transTypeSelect);

  const transDistGroup = helpers.createElement('div', 'form-group');
  const transDistLabel = helpers.createElement('label', 'form-label', { text: 'Distance (in km):', for: 'calc-trans-dist' });
  const transDistInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '25', id: 'calc-trans-dist' });
  transDistGroup.appendChild(transDistLabel);
  transDistGroup.appendChild(transDistInput);

  fTrans.appendChild(transTypeGroup);
  fTrans.appendChild(transDistGroup);
  formsContainer.appendChild(fTrans);

  // ------------------------------------
  // FORM 2: FOOD
  // ------------------------------------
  const fFood = helpers.createElement('div', 'calc-step-panel');

  const foodTypeGroup = helpers.createElement('div', 'form-group');
  const foodTypeLabel = helpers.createElement('label', 'form-label', { text: 'Food/Product Category:', for: 'calc-food-type' });
  const foodTypeSelect = helpers.createElement('select', 'form-select', { id: 'calc-food-type' });
  const foodOptions = [
    { val: 'beef', label: 'Red Meat (Beef)' },
    { val: 'lamb', label: 'Red Meat (Lamb)' },
    { val: 'cheese', label: 'Cheese / Dairy Products' },
    { val: 'pork', label: 'Pork Meat' },
    { val: 'poultry', label: 'Poultry / Chicken' },
    { val: 'fishFarmed', label: 'Fish (Farmed)' },
    { val: 'milk', label: 'Milk (per Liter)' },
    { val: 'rice', label: 'White Rice' },
    { val: 'tofu', label: 'Tofu / Soy Protein' },
    { val: 'vegetables', label: 'Fresh Vegetables' }
  ];
  foodOptions.forEach(opt => {
    foodTypeSelect.appendChild(helpers.createElement('option', [], { value: opt.val, text: opt.label }));
  });
  foodTypeGroup.appendChild(foodTypeLabel);
  foodTypeGroup.appendChild(foodTypeSelect);

  const foodQtyGroup = helpers.createElement('div', 'form-group');
  const foodQtyLabel = helpers.createElement('label', 'form-label', { text: 'Quantity (in kg or Liters):', for: 'calc-food-qty' });
  const foodQtyInput = helpers.createElement('input', 'form-control', { type: 'number', step: '0.1', min: '0', value: '0.5', id: 'calc-food-qty' });
  foodQtyGroup.appendChild(foodQtyLabel);
  foodQtyGroup.appendChild(foodQtyInput);

  fFood.appendChild(foodTypeGroup);
  fFood.appendChild(foodQtyGroup);
  formsContainer.appendChild(fFood);

  // ------------------------------------
  // FORM 3: ENERGY
  // ------------------------------------
  const fEnergy = helpers.createElement('div', 'calc-step-panel');

  const energyTypeGroup = helpers.createElement('div', 'form-group');
  const energyTypeLabel = helpers.createElement('label', 'form-label', { text: 'Energy Source:', for: 'calc-energy-type' });
  const energyTypeSelect = helpers.createElement('select', 'form-select', { id: 'calc-energy-type' });
  const energyOptions = [
    { val: 'electricity', label: 'Utility Grid Electricity' },
    { val: 'naturalGasKwh', label: 'Natural Gas (per kWh)' },
    { val: 'heatingOilLitre', label: 'Heating Oil (per Liter)' },
    { val: 'lpgLitre', label: 'LPG Gas Cylinder (per Liter)' }
  ];
  energyOptions.forEach(opt => {
    energyTypeSelect.appendChild(helpers.createElement('option', [], { value: opt.val, text: opt.label }));
  });
  energyTypeGroup.appendChild(energyTypeLabel);
  energyTypeGroup.appendChild(energyTypeSelect);

  const energyQtyGroup = helpers.createElement('div', 'form-group');
  const energyQtyLabel = helpers.createElement('label', 'form-label', { text: 'Consumption Amount (kWh or Liters):', for: 'calc-energy-qty' });
  const energyQtyInput = helpers.createElement('input', 'form-control', { type: 'number', min: '0', value: '100', id: 'calc-energy-qty' });
  energyQtyGroup.appendChild(energyQtyLabel);
  energyQtyGroup.appendChild(energyQtyInput);

  fEnergy.appendChild(energyTypeGroup);
  fEnergy.appendChild(energyQtyGroup);
  formsContainer.appendChild(fEnergy);

  // ------------------------------------
  // FORM 4: SHOPPING
  // ------------------------------------
  const fShop = helpers.createElement('div', 'calc-step-panel');

  const shopTypeGroup = helpers.createElement('div', 'form-group');
  const shopTypeLabel = helpers.createElement('label', 'form-label', { text: 'Item Category:', for: 'calc-shop-type' });
  const shopTypeSelect = helpers.createElement('select', 'form-select', { id: 'calc-shop-type' });
  const shopOptions = [
    { val: 'tshirt', label: 'Apparel (T-shirt / Top)' },
    { val: 'jeans', label: 'Apparel (Jeans)' },
    { val: 'shoes', label: 'Footwear (Pair of shoes)' },
    { val: 'smartphone', label: 'Electronics (Smartphone)' },
    { val: 'laptop', label: 'Electronics (Laptop)' },
    { val: 'television', label: 'Home Appliances (TV)' }
  ];
  shopOptions.forEach(opt => {
    shopTypeSelect.appendChild(helpers.createElement('option', [], { value: opt.val, text: opt.label }));
  });
  shopTypeGroup.appendChild(shopTypeLabel);
  shopTypeGroup.appendChild(shopTypeSelect);

  const shopQtyGroup = helpers.createElement('div', 'form-group');
  const shopQtyLabel = helpers.createElement('label', 'form-label', { text: 'Quantity (items):', for: 'calc-shop-qty' });
  const shopQtyInput = helpers.createElement('input', 'form-control', { type: 'number', min: '1', value: '1', id: 'calc-shop-qty' });
  shopQtyGroup.appendChild(shopQtyLabel);
  shopQtyGroup.appendChild(shopQtyInput);

  fShop.appendChild(shopTypeGroup);
  fShop.appendChild(shopQtyGroup);
  formsContainer.appendChild(fShop);

  // ------------------------------------
  // FORM 5: WASTE
  // ------------------------------------
  const fWaste = helpers.createElement('div', 'calc-step-panel');

  const wasteTypeGroup = helpers.createElement('div', 'form-group');
  const wasteTypeLabel = helpers.createElement('label', 'form-label', { text: 'Waste Stream:', for: 'calc-waste-type' });
  const wasteTypeSelect = helpers.createElement('select', 'form-select', { id: 'calc-waste-type' });
  const wasteOptions = [
    { val: 'landfillGeneral', label: 'General Garbage (Landfill)' },
    { val: 'landfillFood', label: 'Food Waste (Landfill Methane)' },
    { val: 'recyclingAverage', label: 'Recyclables (Recycling Stream)' },
    { val: 'composting', label: 'Organics Composting' }
  ];
  wasteOptions.forEach(opt => {
    wasteTypeSelect.appendChild(helpers.createElement('option', [], { value: opt.val, text: opt.label }));
  });
  wasteTypeGroup.appendChild(wasteTypeLabel);
  wasteTypeGroup.appendChild(wasteTypeSelect);

  const wasteQtyGroup = helpers.createElement('div', 'form-group');
  const wasteQtyLabel = helpers.createElement('label', 'form-label', { text: 'Weight of waste (in kg):', for: 'calc-waste-qty' });
  const wasteQtyInput = helpers.createElement('input', 'form-control', { type: 'number', step: '0.5', min: '0', value: '10', id: 'calc-waste-qty' });
  wasteQtyGroup.appendChild(wasteQtyLabel);
  wasteQtyGroup.appendChild(wasteQtyInput);

  fWaste.appendChild(wasteTypeGroup);
  fWaste.appendChild(wasteQtyGroup);
  formsContainer.appendChild(fWaste);

  const panels = {
    'tab-transport': fTrans,
    'tab-food': fFood,
    'tab-energy': fEnergy,
    'tab-shopping': fShop,
    'tab-waste': fWaste
  };

  // ------------------------------------
  // UPDATE REALTIME MATHS
  // ------------------------------------
  function performCalculation() {
    const profile = storage.getProfile();
    const country = profile.country || 'in';

    if (currentCategory === 'transport') {
      const type = transTypeSelect.value;
      const km = parseFloat(transDistInput.value || 0);
      calculatedCo2 = calculations.calculateTransport(type, km);
      
      const label = vehicleOptions.find(o => o.val === type)?.label || 'Commuting';
      logPayload = { category: 'transport', type, quantity: km, unit: 'km', label, co2: calculatedCo2 };
    } 
    else if (currentCategory === 'food') {
      const type = foodTypeSelect.value;
      const kg = parseFloat(foodQtyInput.value || 0);
      calculatedCo2 = calculations.calculateFood(type, kg);
      
      const label = `Ate ${foodOptions.find(o => o.val === type)?.label}`;
      logPayload = { category: 'food', type, quantity: kg, unit: 'kg', label, co2: calculatedCo2 };
    } 
    else if (currentCategory === 'energy') {
      const type = energyTypeSelect.value;
      const val = parseFloat(energyQtyInput.value || 0);
      calculatedCo2 = calculations.calculateEnergy(type, val, country);
      
      const label = `Used ${energyOptions.find(o => o.val === type)?.label}`;
      logPayload = { category: 'energy', type, quantity: val, unit: type === 'electricity' ? 'kWh' : 'L', label, co2: calculatedCo2 };
    } 
    else if (currentCategory === 'shopping') {
      const type = shopTypeSelect.value;
      const qty = parseFloat(shopQtyInput.value || 0);
      calculatedCo2 = calculations.calculateShopping(type, qty);
      
      const label = `Purchased ${qty}x ${shopOptions.find(o => o.val === type)?.label}`;
      logPayload = { category: 'shopping', type, quantity: qty, unit: 'pcs', label, co2: calculatedCo2 };
    } 
    else if (currentCategory === 'waste') {
      const type = wasteTypeSelect.value;
      const weight = parseFloat(wasteQtyInput.value || 0);
      calculatedCo2 = calculations.calculateWaste(type, weight);
      
      const label = `Disposed ${weight}kg of ${wasteOptions.find(o => o.val === type)?.label}`;
      logPayload = { category: 'waste', type, quantity: weight, unit: 'kg', label, co2: calculatedCo2 };
    }

    // Update view
    resultDisplayVal.textContent = calculatedCo2.toFixed(1);
    resultEquivalent.textContent = `Equivalent to ${Math.round(calculatedCo2 * 125).toLocaleString()} smartphone charges or ${(calculatedCo2 * 5.9).toFixed(1)} km driven.`;
  }

  // Bind Listeners for calculations on input edit
  const formElements = [
    transTypeSelect, transDistInput, 
    foodTypeSelect, foodQtyInput,
    energyTypeSelect, energyQtyInput,
    shopTypeSelect, shopQtyInput,
    wasteTypeSelect, wasteQtyInput
  ];
  
  formElements.forEach(el => {
    el.addEventListener('input', performCalculation);
  });

  // Tab switching
  tabsHeader.querySelectorAll('.calc-card-option').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsHeader.querySelectorAll('.calc-card-option').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('selected');
      tab.setAttribute('aria-selected', 'true');
      
      const tabId = tab.getAttribute('data-tab');
      currentCategory = tabId.replace('tab-', '');

      // Show panel
      Object.entries(panels).forEach(([pId, pEl]) => {
        if (pId === tabId) {
          pEl.classList.add('active');
        } else {
          pEl.classList.remove('active');
        }
      });

      performCalculation();
    });

    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // Log activity
  logBtn.addEventListener('click', () => {
    if (calculatedCo2 <= 0) {
      toast.error("Please specify a valid quantity first.");
      return;
    }
    
    // Add to LocalStorage
    storage.addActivity(logPayload);
    
    // Add XP Alert
    const levelCheck = storage.addXP(20); // 20 XP for calculator logging
    toast.success(`Logged: ${logPayload.label} (+${calculatedCo2.toFixed(1)} kg CO₂)`);
    
    if (levelCheck.leveledUp) {
      toast.info(`🎉 LEVEL UP! You are now Level ${levelCheck.profile.level}!`);
    }

    // Reset fields
    transDistInput.value = '0';
    foodQtyInput.value = '0';
    energyQtyInput.value = '0';
    shopQtyInput.value = '0';
    wasteQtyInput.value = '0';
    performCalculation();
  });

  // Initial math run
  performCalculation();
  setTimeout(() => helpers.refreshIcons(), 50);

  return container;
}
