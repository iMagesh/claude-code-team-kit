'use strict';

// Money is stored as integer cents to avoid floating-point errors.
// Discounts are in basis points (1 bp = 0.01%) so the arithmetic stays integer too.
const BPS_PER_WHOLE = 10_000;
const DISCOUNT_BPS = Object.freeze({ SAVE10: 1_000, SAVE25: 2_500 });

function assertSku(sku) {
  if (typeof sku !== 'string' || sku === '') throw new Error('sku must be a non-empty string');
}

function createCart() {
  return { items: [], code: null };
}

function addItem(cart, { sku, priceCents, qty = 1 }) {
  assertSku(sku);
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error('priceCents must be a non-negative integer');
  }
  if (!Number.isInteger(qty) || qty < 1) throw new Error('qty must be a positive integer');

  const existing = cart.items.find((i) => i.sku === sku);
  if (existing && existing.priceCents !== priceCents) {
    throw new Error(`price mismatch for sku ${sku}: cart has ${existing.priceCents}, got ${priceCents}`);
  }
  if (existing) existing.qty += qty;
  else cart.items.push({ sku, priceCents, qty });
  return cart;
}

function removeItem(cart, sku) {
  assertSku(sku);
  cart.items = cart.items.filter((i) => i.sku !== sku);
  return cart;
}

function applyCode(cart, code) {
  // Object.hasOwn, not `in`: `in` also matches inherited keys like "toString".
  if (typeof code !== 'string' || !Object.hasOwn(DISCOUNT_BPS, code)) {
    throw new Error(`unknown discount code: ${code}`);
  }
  cart.code = code;
  return cart;
}

function totalCents(cart) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
  const bps = cart.code ? DISCOUNT_BPS[cart.code] : 0;
  // One integer product, one division, rounded half up to the nearest cent.
  return Math.round((subtotal * (BPS_PER_WHOLE - bps)) / BPS_PER_WHOLE);
}

module.exports = { createCart, addItem, removeItem, applyCode, totalCents };
