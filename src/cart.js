'use strict';

// Money is stored as integer cents to avoid floating-point errors.
const DISCOUNT_CODES = { SAVE10: 0.1, SAVE25: 0.25 };

function createCart() {
  return { items: [], code: null };
}

function addItem(cart, { sku, priceCents, qty = 1 }) {
  if (!sku) throw new Error('sku is required');
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error('priceCents must be a non-negative integer');
  }
  if (!Number.isInteger(qty) || qty < 1) throw new Error('qty must be a positive integer');

  const existing = cart.items.find((i) => i.sku === sku);
  if (existing) existing.qty += qty;
  else cart.items.push({ sku, priceCents, qty });
  return cart;
}

function removeItem(cart, sku) {
  cart.items = cart.items.filter((i) => i.sku !== sku);
  return cart;
}

function applyCode(cart, code) {
  if (!(code in DISCOUNT_CODES)) throw new Error(`unknown discount code: ${code}`);
  cart.code = code;
  return cart;
}

function totalCents(cart) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
  const rate = cart.code ? DISCOUNT_CODES[cart.code] : 0;
  return Math.round(subtotal * (1 - rate));
}

module.exports = { createCart, addItem, removeItem, applyCode, totalCents };
