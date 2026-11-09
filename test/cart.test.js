'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createCart, addItem, removeItem, applyCode, totalCents } = require('../src/cart');

test('totals line items', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000, qty: 2 });
  addItem(cart, { sku: 'B', priceCents: 550 });
  assert.strictEqual(totalCents(cart), 2550);
});

test('merges quantity for the same sku', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  addItem(cart, { sku: 'A', priceCents: 1000, qty: 2 });
  assert.strictEqual(cart.items[0].qty, 3);
});

test('applies a discount code', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  applyCode(cart, 'SAVE10');
  assert.strictEqual(totalCents(cart), 900);
});

test('rejects unknown codes and bad input', () => {
  const cart = createCart();
  assert.throws(() => applyCode(cart, 'NOPE'), /unknown discount code/);
  assert.throws(() => addItem(cart, { sku: 'A', priceCents: 10.5 }), /integer/);
});

test('removes items', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  removeItem(cart, 'A');
  assert.strictEqual(totalCents(cart), 0);
});

test('applies SAVE25', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  applyCode(cart, 'SAVE25');
  assert.strictEqual(totalCents(cart), 750);
});

test('rounds discounted totals half up to the nearest cent', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 5 }); // 5 * 0.9 = 4.5 -> 5
  applyCode(cart, 'SAVE10');
  assert.strictEqual(totalCents(cart), 5);

  const cart2 = createCart();
  addItem(cart2, { sku: 'A', priceCents: 999 }); // 999 * 0.75 = 749.25 -> 749
  applyCode(cart2, 'SAVE25');
  assert.strictEqual(totalCents(cart2), 749);
});

test('rejects inherited object keys and non-string codes', () => {
  const cart = createCart();
  for (const code of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
    assert.throws(() => applyCode(cart, code), /unknown discount code/);
  }
  assert.throws(() => applyCode(cart, undefined), /unknown discount code/);
  assert.throws(() => applyCode(cart, 10), /unknown discount code/);
  assert.strictEqual(cart.code, null);
});

test('rejects invalid sku and qty', () => {
  const cart = createCart();
  assert.throws(() => addItem(cart, { sku: '', priceCents: 100 }), /sku/);
  assert.throws(() => addItem(cart, { sku: 42, priceCents: 100 }), /sku/);
  assert.throws(() => addItem(cart, { sku: 'A', priceCents: 100, qty: 0 }), /qty/);
  assert.throws(() => addItem(cart, { sku: 'A', priceCents: 100, qty: 1.5 }), /qty/);
  assert.throws(() => addItem(cart, { sku: 'A', priceCents: -1 }), /priceCents/);
  assert.strictEqual(cart.items.length, 0);
});

test('rejects a different price for a sku already in the cart', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  assert.throws(() => addItem(cart, { sku: 'A', priceCents: 5 }), /price mismatch for sku A/);
  assert.strictEqual(cart.items[0].qty, 1);
  assert.strictEqual(totalCents(cart), 1000);
});

test('removing an absent sku is a no-op; invalid sku throws', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', priceCents: 1000 });
  removeItem(cart, 'B');
  assert.strictEqual(totalCents(cart), 1000);
  assert.throws(() => removeItem(cart, undefined), /sku/);
});
