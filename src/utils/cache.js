/**
 * In-Memory TTL & LRU Cache for Wallpaper Queries
 */
class MemoryCache {
  /**
   * @param {number} maxSize - Maximum number of cached query keys (default 500)
   * @param {number} defaultTtlMs - Default TTL in milliseconds (default 30 minutes)
   */
  constructor(maxSize = 500, defaultTtlMs = 30 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
    this.cache = new Map();
  }

  /**
   * Normalize search query key
   * @param {string} key
   * @returns {string}
   */
  normalizeKey(key) {
    if (!key || typeof key !== 'string') return '';
    return key.trim().toLowerCase();
  }

  /**
   * Get value from cache if exists and not expired
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const normKey = this.normalizeKey(key);
    if (!normKey) return null;

    const entry = this.cache.get(normKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normKey);
      return null;
    }

    // Refresh LRU order (delete & set moves key to end of Map)
    this.cache.delete(normKey);
    this.cache.set(normKey, entry);

    return entry.value;
  }

  /**
   * Store key-value pair in cache with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs = this.defaultTtlMs) {
    const normKey = this.normalizeKey(key);
    if (!normKey) return;

    if (this.cache.has(normKey)) {
      this.cache.delete(normKey);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest (least recently used) entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(normKey, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Check if cache has a valid key
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get current number of items in cache
   */
  get size() {
    return this.cache.size;
  }
}

const wallpaperCache = new MemoryCache(500, 30 * 60 * 1000);

module.exports = {
  wallpaperCache,
  MemoryCache
};
