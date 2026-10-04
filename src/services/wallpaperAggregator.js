const { fetchWallhavenWallpapers } = require('./providers/wallhavenProvider');
const { fetchUnsplashWallpapers } = require('./providers/unsplashProvider');
const { fetchDuckDuckGoWallpapers } = require('./providers/duckduckgoProvider');
const { wallpaperCache } = require('../utils/cache');

/**
 * Clean/normalize URL for duplication checks
 */
function normalizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase();
  } catch (e) {
    return url.trim().toLowerCase();
  }
}

/**
 * Interleave results from multiple provider arrays and deduplicate
 * @param {Array<Array<object>>} providerResults - Array of provider result arrays
 * @param {number} limit - Target max number of results
 * @returns {Array<object>} Interleaved, deduplicated list of wallpapers
 */
function interleaveAndDeduplicate(providerResults, limit = 30) {
  // Sort each provider's list by resolution (width * height) descending to prioritize high-res links
  const sortedProviders = providerResults.map(list => {
    return [...list].sort((a, b) => {
      const resA = (a.width || 0) * (a.height || 0);
      const resB = (b.width || 0) * (b.height || 0);
      return resB - resA;
    });
  });

  const combined = [];
  const seenUrls = new Set();

  let maxLen = 0;
  for (const list of sortedProviders) {
    if (list.length > maxLen) {
      maxLen = list.length;
    }
  }

  // Interleave round-robin across providers
  for (let i = 0; i < maxLen; i++) {
    for (const providerList of sortedProviders) {
      if (i < providerList.length) {
        const item = providerList[i];
        if (!item || !item.url) continue;

        const normUrl = normalizeUrl(item.url);
        if (!seenUrls.has(normUrl)) {
          seenUrls.add(normUrl);
          combined.push(item);
          if (combined.length >= limit) {
            return combined;
          }
        }
      }
    }
  }

  return combined;
}

/**
 * Aggregate wallpapers from all providers for a given query with caching
 * @param {string} query - Search query
 * @param {object} options - Options such as limit (default 30)
 * @returns {Promise<Array>} List of normalized wallpaper objects
 */
async function aggregateWallpapers(query, options = {}) {
  const limit = options.limit || 30;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const normQuery = query.trim().toLowerCase();

  // 1. In-Memory TTL Cache Hit Check (< 10ms response)
  const cached = wallpaperCache.get(normQuery);
  if (cached) {
    return cached.slice(0, limit);
  }

  // Fetch slightly larger set (up to 60 or limit) so cache can serve varying limit demands
  const fetchLimit = Math.max(limit, 60);
  const providerOptions = { ...options, limit: fetchLimit };

  // 2. Parallel fetch with aggressive 2.5s timeouts via Promise.allSettled
  const results = await Promise.allSettled([
    fetchWallhavenWallpapers(query, providerOptions),
    fetchUnsplashWallpapers(query, providerOptions),
    fetchDuckDuckGoWallpapers(query, providerOptions)
  ]);

  const providerData = results.map((res, idx) => {
    if (res.status === 'fulfilled') {
      return res.value;
    } else {
      console.warn(`Provider index ${idx} rejected or timed out:`, res.reason);
      return [];
    }
  });

  const combinedResults = interleaveAndDeduplicate(providerData, fetchLimit);

  // 3. Save to TTL Cache if results found
  if (combinedResults.length > 0) {
    wallpaperCache.set(normQuery, combinedResults);
  }

  return combinedResults.slice(0, limit);
}

module.exports = {
  aggregateWallpapers,
  interleaveAndDeduplicate,
  normalizeUrl
};
