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
