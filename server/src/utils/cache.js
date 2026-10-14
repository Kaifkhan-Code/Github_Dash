// Tiny in-memory cache with a time-to-live. Good enough for a single
// server instance; with several instances I would move this to Redis.
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
  // Maps keep insertion order, so the first key is the oldest one.
  if (store.size >= MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
  store.set(key, { value, expiresAt: Date.now() + ttl });
}
