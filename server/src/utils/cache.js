
const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_ENTRIES = 500;

const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttl = FIVE_MINUTES) {
 
  if (store.size >= MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
  store.set(key, { value, expiresAt: Date.now() + ttl });
}
