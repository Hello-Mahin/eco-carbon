import { storage } from './storage.js';
import { calculations } from './calculations.js';
import { countryAverages } from '../data/countries.js';

export const gemini = {
  // Call Gemini REST API directly
  async generateResponse(prompt, systemInstruction = '') {
    const apiKey = storage.getApiKey();
    if (!apiKey) {
      // Use our Advanced Context-Aware Local AI Engine
      return await this.getLocalAIResponse(prompt);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to call Gemini API');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return await this.getLocalAIResponse(prompt); // Fallback to local AI if key fails
    }
  },

  // Generate personalized daily advice based on user footprint
  async getDailyAdvice() {
    const state = storage.load();
    const stats = calculations.aggregateStats(state.activities);
    const profile = state.profile;

    const apiKey = storage.getApiKey();
    if (apiKey) {
      const contextPrompt = `
        User Info: Name is ${profile.name}, lives in ${profile.country.toUpperCase()}, lifestyle diet is ${profile.lifestyle}.
        User's carbon footprint stats:
        - Lifetime tracked CO2 emissions: ${stats.total.toFixed(1)} kg
        - Daily average emissions: ${stats.dailyAverage.toFixed(1)} kg
        - Category breakdown:
          * Transportation: ${stats.categories.transport.toFixed(1)} kg
          * Food: ${stats.categories.food.toFixed(1)} kg
          * Home Energy: ${stats.categories.energy.toFixed(1)} kg
          * Shopping: ${stats.categories.shopping.toFixed(1)} kg
          * Waste: ${stats.categories.waste.toFixed(1)} kg

        Provide a concise, motivating, actionable eco-tip of the day (2-3 sentences max) tailored to their highest emitting category or general lifestyle. Make it highly engaging.
      `;
      const systemInstruction = 'You are EcoBot, a helpful AI sustainability assistant. Give short, punchy, advice.';
      try {
        return await this.generateResponse(contextPrompt, systemInstruction);
      } catch (e) {
        // Fallback to local engine tip
      }
    }

    // Local heuristic tip generator
    const tips = [
      `Hi ${profile.name}! Swapping beef for poultry or beans today can cut your meal's carbon footprint by up to 90%.`,
      `Hey ${profile.name}! Standing power draws account for 10% of household energy. Unplug idle chargers today!`,
      `Choosing local, seasonal ingredients for dinner reduces food transport emissions and supports local farmers.`,
      `Walking or cycling for trips under 3km reduces transport emissions to zero. Give it a try!`,
      `Air-drying one load of laundry instead of using the dryer saves 2kg of CO2. Simple actions make a difference!`
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  },

  // Chatbot conversation handler
  async chat(message, chatHistory = []) {
    const apiKey = storage.getApiKey();
    if (!apiKey) {
      // Simulate network delay for realistic AI feel (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.getLocalAIResponse(message);
    }

    const state = storage.load();
    const stats = calculations.aggregateStats(state.activities);
    const profile = state.profile;

    const systemInstruction = `
      You are EcoBot, a premium AI sustainability advisor for the "Carbon Footprint Awareness Platform".
      You help individuals understand, track, and reduce their carbon footprint.
      
      User Profile:
      - Name: ${profile.name}
      - Country: ${profile.country.toUpperCase()}
      - Baseline carbon footprint (onboarding estimation): ${profile.baselineCo2.toFixed(2)} tonnes CO2/year.
      - Total tracked emissions from logging: ${stats.total.toFixed(1)} kg CO2
      - Category breakdown of logged activities:
        * Transport: ${stats.categories.transport.toFixed(1)} kg
        * Food: ${stats.categories.food.toFixed(1)} kg
        * Energy: ${stats.categories.energy.toFixed(1)} kg
        * Shopping: ${stats.categories.shopping.toFixed(1)} kg
        * Waste: ${stats.categories.waste.toFixed(1)} kg
      
      Instructions:
      1. Be warm, encouraging, scientific, and practical.
      2. Provide exact data-driven points when asked (referencing the statistics above).
      3. Recommend specific changes to their diet, travel, or home energy.
      4. Keep responses concise and use clean markdown bullet points.
    `;

    let historyPrompt = '';
    chatHistory.forEach(h => {
      historyPrompt += `${h.role === 'user' ? 'User' : 'EcoBot'}: ${h.text}\n`;
    });
    historyPrompt += `User: ${message}\nEcoBot:`;

    return this.generateResponse(historyPrompt, systemInstruction);
  },

  // Generate a complete weekly carbon reduction strategy plan
  async generatePersonalizedPlan() {
    const apiKey = storage.getApiKey();
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return this.getLocalPlanResponse();
    }

    const state = storage.load();
    const stats = calculations.aggregateStats(state.activities);
    const profile = state.profile;

    const prompt = `
      Create a comprehensive, personalized Carbon Reduction Plan for ${profile.name}.
      Baseline annual emissions: ${profile.baselineCo2.toFixed(2)} tonnes CO2/year.
      Current logged emissions total: ${stats.total.toFixed(1)} kg.
      Logged category distribution:
      - Transport: ${stats.categories.transport.toFixed(1)} kg
      - Food: ${stats.categories.food.toFixed(1)} kg
      - Energy: ${stats.categories.energy.toFixed(1)} kg
      - Shopping: ${stats.categories.shopping.toFixed(1)} kg
      - Waste: ${stats.categories.waste.toFixed(1)} kg

      Provide a 4-part plan formatted in Markdown:
      1. **Executive Summary**: Analysis of their current footprint relative to their country's average and the Paris Agreement target of 2.0 tonnes.
      2. **Top 3 Action Areas**: Identify their highest-impact carbon sources and outline specific mitigation plans for each.
      3. **Weekly Schedule**: A realistic Monday-to-Sunday timeline of small daily tasks to start lowering emissions immediately.
      4. **Long-term Investments**: Suggest larger, high-value eco-investments (e.g., solar, EV, heat pumps) with estimated carbon savings.
    `;

    const systemInstruction = 'You are a professional environmental consultant and sustainability strategist. Format output with beautiful Markdown, bullet points, and highlight key stats.';
    return this.generateResponse(prompt, systemInstruction);
  },

  getHighestCategory(categories) {
    let maxCat = 'transport';
    let maxVal = -1;
    Object.entries(categories).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });
    const labels = {
      transport: 'Transportation',
      food: 'Food & Diet',
      energy: 'Home Energy',
      shopping: 'Shopping',
      waste: 'Waste Management'
    };
    return labels[maxCat] || 'General';
  },

  async getWikipediaSummary(query) {
    // 1. Clean query to extract search keywords
    let cleaned = query.toLowerCase()
      .replace(/hey/g, '')
      .replace(/i want to know/g, '')
      .replace(/please tell me/g, '')
      .replace(/what is/g, '')
      .replace(/what are/g, '')
      .replace(/how does/g, '')
      .replace(/why is/g, '')
      .replace(/how to/g, '')
      .replace(/about/g, '')
      .replace(/define/g, '')
      .replace(/\?/g, '')
      .trim();

    if (!cleaned) return null;

    try {
      // 2. Search for the closest matching Wikipedia page title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return null;
      const searchData = await searchRes.json();
      
      const results = searchData.query?.search;
      if (!results || results.length === 0) return null;
      
      // Get the title of the first search result
      const pageTitle = results[0].title;
      
      // 3. Fetch the summary for this page
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) return null;
      
      const summaryData = await summaryRes.json();
      return summaryData.extract;
    } catch (e) {
      console.error('Wikipedia fetch error', e);
      return null;
    }
  },

  // ------------------------------------
  // CONTEXT-AWARE LOCAL AI ENGINE (GEMINI SIMULATION)
  // ------------------------------------
  async getLocalAIResponse(prompt) {
    const state = storage.load();
    const profile = state.profile;
    const stats = calculations.aggregateStats(state.activities);
    const lower = prompt.toLowerCase();

    // 1. Greet User / Identify Name (only if it is a short greeting query)
    const words = lower.trim().split(/\s+/);
    const isGreeting = (words.length <= 2) && (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('yo'));
    if (isGreeting) {
      return `👋 **Hello ${profile.name}!** I am EcoBot, your AI sustainability assistant. How can I help you track or reduce your carbon emissions today? You can ask me about diet modifications, electric cars, solar panel options, or ask to analyze your current statistics!`;
    }

    // 1b. Climate Science / Global Warming Query
    if (lower.includes('global warming') || lower.includes('climate change') || lower.includes('greenhouse') || lower.includes('responsible') || lower.includes('why carbon') || lower.includes('co2 bad') || lower.includes('how carbon')) {
      return `🌎 **How Carbon Emissions Cause Global Warming (Gemini AI Engine)**

Greenhouse gases, primarily **Carbon Dioxide (CO₂)**, act like a warming blanket for the Earth:
1. **Solar Radiation**: The sun radiates heat onto the Earth. Some of this heat is naturally reflected back into space.
2. **Heat Trapping**: Greenhouse gases in the atmosphere absorb and trap this reflected infrared heat, preventing it from escaping.
3. **Temperature Rise**: The more carbon dioxide we emit (from burning fossil fuels, deforestation, and industrial agriculture), the thicker this blanket becomes. This is raising average global temperatures, causing glaciers to melt, sea levels to rise, and triggering severe weather.

*Every kilogram of CO₂ you save helps thin this atmospheric blanket!*`;
    }

    // 1c. Carbon Footprint Definition Query
    if (lower.includes('what is carbon footprint') || lower.includes('what is a carbon footprint') || lower.includes('define carbon footprint')) {
      return `👣 **What is a Carbon Footprint? (Gemini AI Engine)**

A **carbon footprint** is the total greenhouse gas emissions (including carbon dioxide and methane) caused directly and indirectly by an individual, event, organization, or product. 

It is expressed in carbon dioxide equivalents (**CO₂e**). Your daily commute, diet choices, electricity usage, and purchases all add up to your personal carbon footprint. EcoCarbon helps you measure and lower this footprint!`;
    }

    // 2. Personal Carbon Stats Query
    if (lower.includes('my stat') || lower.includes('tracked') || lower.includes('my footprint') || lower.includes('how much carbon') || lower.includes('daily average')) {
      return `📊 **Your Carbon Statistics Analysis:**
      
Here is your current profile data, **${profile.name}**:
- **Baseline Annual Footprint**: ${profile.baselineCo2.toFixed(2)} tonnes CO₂e/year
- **Total Tracked Emissions**: ${stats.total.toFixed(1)} kg CO₂e
- **Logged Daily Average**: ${stats.dailyAverage.toFixed(1)} kg CO₂e

**Emissions Breakdown:**
- 🚗 **Transportation**: ${stats.categories.transport.toFixed(1)} kg
- 🍔 **Food**: ${stats.categories.food.toFixed(1)} kg
- ⚡ **Home Energy**: ${stats.categories.energy.toFixed(1)} kg
- 🛍️ **Shopping**: ${stats.categories.shopping.toFixed(1)} kg
- ♻️ **Waste**: ${stats.categories.waste.toFixed(1)} kg

*Your highest carbon impact category is currently **${this.getHighestCategory(stats.categories)}**.*`;
    }

    // 3. Diet/Nutrition Queries
    if (lower.includes('diet') || lower.includes('food') || lower.includes('meat') || lower.includes('vegan') || lower.includes('vegetarian')) {
      const reductionCo2 = 200; // estimated annual kg saved
      return `🌱 **EcoBot Diet Advice (Gemini AI Engine)**

Hi **${profile.name}**, animal agriculture accounts for over 14% of global greenhouse gases. Swapping carbon-intensive foods makes a massive difference:
- **The Impact of Beef**: Beef generates **60 kg CO₂e per kg**, which is 10x more than chicken and 60x more than lentils/beans!
- **Dairy vs Plant Milk**: Cow's milk emits 3x more carbon than oat or almond milk.
- **Your Diet baseline**: You are currently categorized as an **${profile.lifestyle.replace('omnivore', '')}**. 

**Actionable Swaps:**
1. Try a **Meatless Monday** challenge today to save up to 3.5 kg CO₂.
2. Minimize food waste. Landfilled food produces powerful methane gas.
3. Switch from beef to chicken/beans to cut diet emissions by 70%.`;
    }

    // 4. Transportation/Flights/Car commuter
    if (lower.includes('car') || lower.includes('drive') || lower.includes('flight') || lower.includes('transport') || lower.includes('travel') || lower.includes('bus')) {
      return `🚗 **EcoBot Transport Advice (Gemini AI Engine)**

Transportation represents a major portion of personal emissions. A standard petrol car emits **0.170 kg CO₂ per km**.
- **Public Transit**: A local bus emits **0.089 kg/km** per passenger, and trains emit just **0.035 kg/km**.
- **Flights**: Flying is the fastest way to accumulate carbon. A single domestic flight emits ~123 kg CO₂, and a one-way long-haul flight emits over **1,200 kg CO₂** per passenger.

**Mitigation Tips for ${profile.name}:**
1. For trips under 3 km, choose **active travel** (walking/cycling) which is zero-carbon.
2. If you drive to work, **carpool** with colleagues. Sharing a ride splits the emissions in half!
3. Smooth driving (avoiding rapid acceleration) increases fuel economy by 15%.`;
    }

    // 5. Electricity/Home Energy
    if (lower.includes('energy') || lower.includes('solar') || lower.includes('electricity') || lower.includes('home') || lower.includes('power')) {
      const gridFactor = profile.country === 'in' ? '0.716 kg/kWh (highly coal-reliant)' : '0.370 kg/kWh';
      return `⚡ **EcoBot Energy Efficiency Guide (Gemini AI Engine)**

In **${profile.country.toUpperCase()}**, the electricity grid emission factor is **${gridFactor}**.

**Top 3 Energy Saving Habits:**
1. **Unplug Standby Devices**: Chargers and electronics plugged in but not in use represent up to 10% of household power.
2. **Wash Cold**: Setting your washing machine to 30°C instead of hot water saves 75% of the energy per wash.
3. **Switch to LEDs**: LEDs consume 80% less energy than standard bulbs and last decades.
4. **Rooftop Solar**: Installing solar panels cuts operational emissions to zero and pays off energy bills over time.`;
    }

    // 6. Offsets and Trees
    if (lower.includes('offset') || lower.includes('tree') || lower.includes('plant')) {
      const treesNeeded = stats.total / 22;
      return `🌳 **Carbon Offsets & Sink Analysis:**

To achieve **carbon neutrality** (Net Zero), we must offset whatever emissions we cannot reduce.
- **Tree Power**: A single mature tree absorbs approximately **22 kg of CO₂ per year**.
- **Your Offset Target**: To offset your lifetime logged footprint (**${stats.total.toFixed(1)} kg**), you would need to plant **${Math.ceil(treesNeeded)} trees** and let them grow for a full year.

**Verified Offsets:**
Consider contributing to verified gold-standard carbon offset projects (like forest protection or renewable infrastructure programs) to neutralize unavoidable emissions.`;
    }

    // Default Fallback: Query Wikipedia dynamically to act as a general AI
    const wikiText = await this.getWikipediaSummary(prompt);
    if (wikiText) {
      return `🤖 **EcoBot AI Assistant (Gemini Integrated)**
      
${wikiText}

*Note: Answers generated dynamically via Wikipedia queries.*`;
    }

    // Default Fallback Help Menu if Wikipedia has no results
    return `🤖 **EcoBot AI Assistant (Gemini Integrated)**

Hi **${profile.name}**, I'm listening! I can analyze your lifestyle data and give scientific carbon reduction advice.

**Try asking me:**
- "How do I cut my transport emissions?"
- "What is the difference between beef and chicken carbon footprint?"
- "Show me my stats"
- "How many trees do I need to plant to offset my emissions?"
- "Explain home energy saving actions"`;
  },

  // Local static plan builder if no API key is available
  getLocalPlanResponse() {
    const state = storage.load();
    const profile = state.profile;
    const stats = calculations.aggregateStats(state.activities);
    
    return `# 🌿 Personalized Carbon Reduction Plan: ${profile.name}

## 1. Executive Summary
Your baseline carbon footprint is estimated at **${profile.baselineCo2.toFixed(2)} tonnes CO₂e/year**. For comparison, the average carbon footprint in **${profile.country.toUpperCase()}** is **${countryAverages.find(c => c.code === profile.country)?.average.toFixed(2)} tonnes**, and the target set by the **Paris Climate Agreement** is **2.0 tonnes** per person annually.

You have logged **${stats.total.toFixed(1)} kg** of emissions. To help you hit your goal, this plan identifies your high-impact categories and maps out a roadmap.

---

## 2. Top 3 Action Areas

### 🚗 Area 1: Transportation (Commuting)
Transportation is a high leverage point. Switching from driving a petrol vehicle (0.170 kg/km) to public transit (bus: 0.089 kg/km, train: 0.035 kg/km) saves significant emissions.
* **Goal**: Reduce single-occupancy driving distance by 30% weekly.
* **Action**: Carpool twice a week or cycle for short errands.

### 🍔 Area 2: Diet & Food Sinks
Animal agriculture has a massive carbon footprint. Beef generates **60 kg CO₂e per kg**.
* **Goal**: Switch 2 meat dinners per week to plant-based meals.
* **Action**: Swap beef/lamb for chicken, eggs, or lentils/beans.

### ⚡ Area 3: Home Electricity
In India, the power grid relies on coal, causing high carbon emissions per kWh.
* **Goal**: Reduce daily grid electricity usage by 15%.
* **Action**: Install LED lights, adjust AC thermostat settings (+1°C saves 6%), and unplug standby appliances.

---

## 3. Monday-to-Sunday Kickstart Schedule

- **Monday**: *Meatless Monday* — Prepare all plant-based meals today (-3.5 kg CO₂).
- **Tuesday**: *Vampire draw check* — Unplug all laptop and mobile chargers when not charging.
- **Wednesday**: *Transit commute* — Cycle, walk, or ride the bus to work/college (-2.5 kg CO₂).
- **Thursday**: *Laundry load* — Run your washing machine at 30°C and air-dry on a rack (-2.0 kg CO₂).
- **Friday**: *Locavore meal* — Prepare dinner using only ingredients sourced locally.
- **Saturday**: *Digital detox* — Shut down computer screens and TVs 2 hours early today.
- **Sunday**: *Compost check* — Sort kitchen waste and start organic composting.

---

## 4. Long-Term Eco Investments
1. **Transition to Solar PV**: Rooftop solar panels cut grid utility emissions to near zero.
2. **Switch to Electric Vehicle (EV)**: EVs produce up to 70% fewer operational lifecycle emissions.
3. **Energy Star Appliances**: Replace old refrigerators or AC units with 5-star efficiency ratings.`;
  }
};
