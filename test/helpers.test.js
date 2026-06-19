import test from 'node:test';
import assert from 'node:assert';
import { helpers } from '../src/utils/helpers.js';

test('Helpers - escapeHtml sanitization', () => {
  const unsafe = '<script>alert("xss")</script> & "test"';
  const clean = helpers.escapeHtml(unsafe);
  assert.strictEqual(clean, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;test&quot;');
});

test('Helpers - formatCo2 format cases', () => {
  // Case 1: Less than 1000 kg (outputs kg)
  assert.strictEqual(helpers.formatCo2(450), '450 kg CO₂e');
  
  // Case 2: 1000 kg or more (outputs tonnes with 2 decimals)
  assert.strictEqual(helpers.formatCo2(1250), '1.25 t CO₂e');
  
  // Case 3: Invalid input
  assert.strictEqual(helpers.formatCo2(NaN), '0 kg CO₂e');
});

test('Helpers - formatCo2Saving format cases', () => {
  assert.strictEqual(helpers.formatCo2Saving(20.4), '20.4 kg saved');
  assert.strictEqual(helpers.formatCo2Saving(3500), '3.50 t saved');
  assert.strictEqual(helpers.formatCo2Saving(NaN), '0 kg saved');
});

test('Helpers - formatDate checks', () => {
  const dateStr = '2026-06-19T12:00:00Z';
  const formatted = helpers.formatDate(dateStr);
  // Result should contain the month and year
  assert.ok(formatted.includes('2026'));
  assert.ok(formatted.includes('Jun'));
});

test('Helpers - getCategoryInfo details', () => {
  const transportInfo = helpers.getCategoryInfo('transport');
  assert.strictEqual(transportInfo.icon, 'car');
  assert.strictEqual(transportInfo.color, 'text-blue-400');

  const foodInfo = helpers.getCategoryInfo('food');
  assert.strictEqual(foodInfo.icon, 'beef');
  assert.strictEqual(foodInfo.color, 'text-orange-400');
});

test('Helpers - timeAgo cases', () => {
  const now = new Date();
  assert.strictEqual(helpers.timeAgo(now.toISOString()), 'Just now');
  
  const minAgo = new Date(now - 65 * 1000);
  assert.strictEqual(helpers.timeAgo(minAgo.toISOString()), '1m ago');

  const hourAgo = new Date(now - 3700 * 1000);
  assert.strictEqual(helpers.timeAgo(hourAgo.toISOString()), '1h ago');

  const dayAgo = new Date(now - 86450 * 1000);
  assert.strictEqual(helpers.timeAgo(dayAgo.toISOString()), '1d ago');
});

test('Helpers - createElement mock DOM', () => {
  // Mock DOM Environment
  globalThis.document = {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        classList: {
          classes: [],
          add(c) { this.classes.push(c); }
        },
        setAttribute(key, val) { this[key] = val; },
        appendChild(child) { this.children.push(child); },
        children: []
      };
    },
    createTextNode(text) {
      return { textNode: true, textContent: text };
    }
  };
  globalThis.HTMLElement = class MockHTMLElement {};

  const el = helpers.createElement('div', 'my-class', { id: 'test-el', text: 'Hello' });
  assert.strictEqual(el.tagName, 'DIV');
  assert.strictEqual(el.className, 'my-class');
  assert.strictEqual(el.id, 'test-el');
  assert.strictEqual(el.textContent, 'Hello');

  const parent = helpers.createElement('div', [], {}, [el, 'TextNodeChild']);
  assert.strictEqual(parent.children.length, 2);
  assert.strictEqual(parent.children[0], el);
  assert.strictEqual(parent.children[1].textContent, 'TextNodeChild');

  // Clean mock
  delete globalThis.document;
  delete globalThis.HTMLElement;
});

test('Helpers - refreshIcons mock window', () => {
  let created = false;
  globalThis.window = {
    lucide: {
      createIcons() {
        created = true;
      }
    }
  };

  helpers.refreshIcons();
  assert.strictEqual(created, true);

  // Clean mock
  delete globalThis.window;
});

