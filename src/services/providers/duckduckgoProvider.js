const { httpClient } = require('../../utils/httpClient');

/**
 * Helper to fetch vqd token from DuckDuckGo with lightweight headers & fast timeout
 */
async function getVqdToken(query) {
  try {
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images&iax=images`;
    const response = await httpClient.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 2000
    });

    const html = response.data;
    if (typeof html !== 'string') return null;

    const vqdMatch = html.match(/vqd=['"]?([\d-]+)['"]?/i) ||
                     html.match(/vqd=([\d-]+)/i) ||
                     html.match(/vqd=['"]?([^'"&\s]+)['"]?/i);

    return vqdMatch ? vqdMatch[1] : null;
  } catch (error) {
    console.warn('DuckDuckGo provider: vqd token fetch failed or timed out:', error.message);
    return null;
  }
}

/**
 * Fetch wallpapers from DuckDuckGo Image Search API
 * @param {string} query - Search term
 * @param {object} options - Optional params
 * @returns {Promise<Array>} Normalized array of wallpaper objects
 */
async function fetchDuckDuckGoWallpapers(query, options = {}) {
  try {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    const vqd = await getVqdToken(query);
    if (!vqd) {
      return [];
    }

    const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`;
    const response = await httpClient.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/',
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      },
      timeout: 2500
    });

    if (!response.data || !Array.isArray(response.data.results)) {
      return [];
    }

    return response.data.results.map((item, index) => ({
      id: `ddg_${index}_${Buffer.from(item.image || '').toString('base64').substring(0, 10)}`,
      title: item.title || `${query} wallpaper`,
      url: item.image,
      thumbnail: item.thumbnail || item.image,
      width: parseInt(item.width, 10) || 0,
      height: parseInt(item.height, 10) || 0,
      source: 'duckduckgo'
    })).filter(img => img.url);
  } catch (error) {
    console.warn('DuckDuckGo provider error:', error.message);
    return [];
  }
}

module.exports = { fetchDuckDuckGoWallpapers };
