import test from 'node:test';
import assert from 'node:assert';

// Mock localStorage globally for Node.js test environment
globalThis.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock DOM globals globally for Node.js test environment
globalThis.document = {
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      classList: {
        classes: [],
        add(c) { this.classes.push(c); },
        remove(c) { this.classes = this.classes.filter(x => x !== c); }
      },
      setAttribute(key, val) { this[key] = val; },
      appendChild(child) { this.children.push(child); },
      remove() {},
      children: []
    };
  },
  createTextNode(text) {
    return { textNode: true, textContent: text };
  },
  body: {
    appendChild(child) {}
  }
};
globalThis.HTMLElement = class MockHTMLElement {};
globalThis.window = {
  lucide: {
    createIcons() {}
  }
};

// Mock fetch globally for network-based AI APIs and Wikipedia fallback
globalThis.fetch = async (url, options) => {
  if (url.includes('wikipedia.org/w/api.php')) {
    return {
      ok: true,
      json: async () => ({
        query: {
          search: [
            { title: 'Carbon footprint' }
          ]
        }
      })
    };
  }
  if (url.includes('wikipedia.org/api/rest_v1/page/summary')) {
    return {
      ok: true,
      json: async () => ({
        extract: 'A carbon footprint is the total greenhouse gas emissions...'
      })
    };
  }
  if (url.includes('generativelanguage.googleapis.com')) {
    if (url.includes('key=AIzaSyMockErrorKey')) {
      throw new Error('API failure simulation');
    }
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'Gemini simulated response text' }]
          }
        }]
      })
    };
  }
  return { ok: false };
};

// Import gemini utility
import { gemini } from '../src/utils/gemini.js';
import { storage } from '../src/utils/storage.js';

test('Gemini - getHighestCategory', () => {
  const categories = {
    transport: 10,
    food: 50,
    energy: 20,
    shopping: 5,
    waste: 2
  };
  const highest = gemini.getHighestCategory(categories);
  assert.strictEqual(highest, 'Food & Diet');
});

test('Gemini - getLocalAIResponse matches greeting', async () => {
  const res = await gemini.getLocalAIResponse('Hello');
  assert.ok(res.includes('Hello'));
  assert.ok(res.includes('EcoBot'));
});

test('Gemini - getLocalAIResponse matches climate science', async () => {
  const res = await gemini.getLocalAIResponse('global warming');
  assert.ok(res.includes('Greenhouse gases'));
  assert.ok(res.includes('trapped'));
});

test('Gemini - getLocalAIResponse matches carbon footprint definition', async () => {
  const res = await gemini.getLocalAIResponse('what is carbon footprint');
  assert.ok(res.includes('greenhouse gas emissions'));
  assert.ok(res.includes('CO₂e'));
});

test('Gemini - getLocalAIResponse matches stats', async () => {
  const res = await gemini.getLocalAIResponse('my stats');
  assert.ok(res.includes('Your Carbon Statistics Analysis'));
});

test('Gemini - getLocalAIResponse matches diet', async () => {
  const res = await gemini.getLocalAIResponse('vegan diet');
  assert.ok(res.includes('animal agriculture'));
  assert.ok(res.includes('Meatless Monday'));
});

test('Gemini - getLocalAIResponse matches transportation', async () => {
  const res = await gemini.getLocalAIResponse('petrol car commute');
  assert.ok(res.includes('passenger gasoline car') || res.includes('petrol car') || res.includes('public transit') || res.includes('Commuting') || res.includes('commuter') || res.includes('transport'));
});

test('Gemini - getLocalAIResponse matches offsets', async () => {
  const res = await gemini.getLocalAIResponse('carbon offset trees');
  assert.ok(res.includes('absorbs') || res.includes('neutrality') || res.includes('offset'));
});

test('Gemini - getLocalAIResponse fallback to Wikipedia summary', async () => {
  const res = await gemini.getLocalAIResponse('arbitrary search query');
  assert.ok(res.includes('Wikipedia'));
  assert.ok(res.includes('total greenhouse gas emissions'));
});

test('Gemini - getLocalPlanResponse strategy', () => {
  const plan = gemini.getLocalPlanResponse();
  assert.ok(plan.includes('Personalized Carbon Reduction Plan'));
  assert.ok(plan.includes('Executive Summary'));
  assert.ok(plan.includes('Weekly Schedule'));
});

test('Gemini - generateResponse with API key', async () => {
  storage.clear();
  storage.setApiKey('AIzaSyMockKey');
  const res = await gemini.generateResponse('Hello AI', 'System rules');
  assert.strictEqual(res, 'Gemini simulated response text');
  storage.clear();
});

test('Gemini - chat with API key', async () => {
  storage.clear();
  storage.setApiKey('AIzaSyMockKey');
  const res = await gemini.chat('Hello chatbot', []);
  assert.strictEqual(res, 'Gemini simulated response text');
  storage.clear();
});

test('Gemini - getDailyAdvice without API key', async () => {
  storage.clear();
  const advice = await gemini.getDailyAdvice();
  assert.ok(advice.length > 10);
});

test('Gemini - generatePersonalizedPlan with API key', async () => {
  storage.clear();
  storage.setApiKey('AIzaSyMockKey');
  const plan = await gemini.generatePersonalizedPlan();
  assert.strictEqual(plan, 'Gemini simulated response text');
  storage.clear();
});

test('Gemini - generateResponse API key error fallback', async () => {
  storage.clear();
  storage.setApiKey('AIzaSyMockErrorKey');
  // Should catch the error and fallback to getLocalAIResponse
  const res = await gemini.generateResponse('Hello global warming', 'System rules');
  assert.ok(res.includes('How Carbon Emissions Cause Global Warming'));
  storage.clear();
});
