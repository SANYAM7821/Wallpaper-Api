const { httpClient } = require('../../utils/httpClient');

/**
 * Fetch wallpapers from Wallhaven API
 * @param {string} query - Search term
 * @param {object} options - Optional params
 * @returns {Promise<Array>} Normalized array of wallpaper objects
 */
async function fetchWallhavenWallpapers(query, options = {}) {
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    // Strip redundant "wallpaper" / "wallpapers" term for cleaner Wallhaven search results
    const cleanQuery = query.replace(/\bwallpapers?\b/gi, '').trim() || query;
    let url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(cleanQuery)}&sorting=relevance`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    let response = await httpClient.get(url, { headers, timeout: 2500 });
    let data = response.data?.data || [];

    // Fallback to raw query if cleaned query yields 0 results
    if (data.length === 0 && cleanQuery !== query) {
      url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&sorting=relevance`;
      response = await httpClient.get(url, { headers, timeout: 2500 });
      data = response.data?.data || [];
    }

    // If limit > 24 (default is 30) and page 1 was full, fetch page 2
    const targetLimit = options.limit || 30;
    if (data.length >= 24 && targetLimit > 24) {
      try {
        const activeQuery = (data.length > 0 && cleanQuery !== query && response.config?.url?.includes(encodeURIComponent(cleanQuery))) ? cleanQuery : query;
        const page2Url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(activeQuery)}&sorting=relevance&page=2`;
        const page2Res = await httpClient.get(page2Url, { headers, timeout: 2500 });
        const page2Data = page2Res.data?.data || [];
        data = [...data, ...page2Data];
      } catch (err) {
        // Ignore page 2 error if page 1 succeeded
      }
    }

    return data.map((item) => ({
      id: `wallhaven_${item.id}`,
      title: item.id ? `${query} (${item.id})` : query,
      url: item.path,
      thumbnail: item.thumbs?.large || item.thumbs?.original || item.thumbs?.small || item.path,
      width: parseInt(item.dimension_x, 10) || 0,
      height: parseInt(item.dimension_y, 10) || 0,
      source: 'wallhaven'
    })).filter(img => img.url);
  } catch (error) {
    console.error('Wallhaven provider error:', error.message);
    return [];
  }
}

module.exports = { fetchWallhavenWallpapers };
