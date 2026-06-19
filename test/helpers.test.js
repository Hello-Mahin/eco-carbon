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
