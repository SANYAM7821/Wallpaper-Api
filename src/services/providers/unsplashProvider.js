const axios = require('axios');

/**
 * Fetch wallpapers from Unsplash public search API
 * @param {string} query - Search term
 * @param {object} options - Optional params
 * @returns {Promise<Array>} Normalized array of wallpaper objects
 */
async function fetchUnsplashWallpapers(query, options = {}) {
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    const perPage = options.perPage || 30;
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;

    let url;
    let headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    };

    if (apiKey) {
      url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      headers['Authorization'] = `Client-ID ${apiKey}`;
    } else {
      url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
    }

    const response = await axios.get(url, { headers, timeout: 10000 });

    if (!response.data || !Array.isArray(response.data.results)) {
      return [];
    }

    return response.data.results.map((item) => ({
      id: `unsplash_${item.id}`,
      title: item.alt_description || item.description || `${query} wallpaper`,
      url: item.urls?.full || item.urls?.regular || item.urls?.raw,
      thumbnail: item.urls?.small || item.urls?.thumb || item.urls?.regular,
      width: parseInt(item.width, 10) || 0,
      height: parseInt(item.height, 10) || 0,
      source: 'unsplash'
    })).filter(img => img.url);
  } catch (error) {
    console.error('Unsplash provider error:', error.message);
    return [];
  }
}

module.exports = { fetchUnsplashWallpapers };
