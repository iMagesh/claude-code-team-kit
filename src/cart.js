'use strict';

// Money is stored as integer cents to avoid floating-point errors.
// Discounts are in basis points (1 bp = 0.01%) so the arithmetic stays integer too.
const BPS_PER_WHOLE = 10_000;
const DISCOUNT_BPS = Object.freeze({ SAVE10: 1_000, SAVE25: 2_500 });

function assertSku(sku) {
  if (typeof sku !== 'string' || sku === '') throw new Error('sku must be a non-empty string');
}

function assertCart(cart) {
  if (cart === null || typeof cart !== 'object' || !Array.isArray(cart.items)) {
    throw new Error('cart must be a cart created by createCart()');
  }
}

// Every amount must stay a safe integer, or the arithmetic silently loses cents.
function assertSafe(value, what) {
  if (!Number.isSafeInteger(value)) throw new Error(`${what} exceeds the safe integer range`);
}

function createCart() {
  return { items: [], code: null };
}

function addItem(cart, { sku, priceCents, qty = 1 } = {}) {
  assertCart(cart);
  assertSku(sku);
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
    throw new Error('priceCents must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(qty) || qty < 1) throw new Error('qty must be a positive safe integer');

  const existing = cart.items.find((i) => i.sku === sku);
  if (existing && existing.priceCents !== priceCents) {
    throw new Error(`price mismatch for sku ${sku}: cart has ${existing.priceCents}, got ${priceCents}`);
  }
  const newQty = existing ? existing.qty + qty : qty;
  assertSafe(newQty, `qty for sku ${sku}`);
  assertSafe(priceCents * newQty, `line total for sku ${sku}`);

  if (existing) existing.qty = newQty;
  else cart.items.push({ sku, priceCents, qty });
  return cart;
}

function removeItem(cart, sku) {
  assertCart(cart);
  assertSku(sku);
  cart.items = cart.items.filter((i) => i.sku !== sku);
  return cart;
}

function applyCode(cart, code) {
  assertCart(cart);
  // Object.hasOwn, not `in`: `in` also matches inherited keys like "toString".
  if (typeof code !== 'string' || !Object.hasOwn(DISCOUNT_BPS, code)) {
    throw new Error(`unknown discount code: ${code}`);
  }
  cart.code = code;
  return cart;
}

function totalCents(cart) {
  assertCart(cart);
  const subtotal = cart.items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
  assertSafe(subtotal, 'cart subtotal');
  const bps = cart.code ? DISCOUNT_BPS[cart.code] : 0;
  // BigInt keeps the product exact; adding half the divisor rounds half up to the nearest cent.
  const whole = BigInt(BPS_PER_WHOLE);
  const total = (BigInt(subtotal) * BigInt(BPS_PER_WHOLE - bps) + whole / 2n) / whole;
  return Number(total);
}

module.exports = { createCart, addItem, removeItem, applyCode, totalCents };
