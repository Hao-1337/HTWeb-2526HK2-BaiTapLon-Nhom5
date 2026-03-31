const STORAGE_KEY = "audiophile_vanilla_cart";

let state = {
  cartItems: []
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return state;
  try {
    state = JSON.parse(raw);
    if (!Array.isArray(state.cartItems)) state.cartItems = [];
  } catch {
    state = { cartItems: [] };
  }
  return state;
}

export function getState() {
  return state;
}

export function clearCart() {
  state.cartItems = [];
  save();
}

export function addToCart(product, unit) {
  const qty = Math.max(1, Number(unit) || 1);
  const existing = state.cartItems.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cartItems.push({ ...product, qty });
  }
  save();
}

export function decrementFromCart(productId) {
  const existing = state.cartItems.find((item) => item.id === productId);
  if (!existing) return;
  if (existing.qty <= 1) {
    state.cartItems = state.cartItems.filter((item) => item.id !== productId);
  } else {
    existing.qty -= 1;
  }
  save();
}

export function incrementCart(productId) {
  const existing = state.cartItems.find((item) => item.id === productId);
  if (!existing) return;
  existing.qty += 1;
  save();
}

export function cartTotal() {
  return state.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
}
