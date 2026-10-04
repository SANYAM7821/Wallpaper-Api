const axios = require('axios');

/**
 * Helper to fetch vqd token from DuckDuckGo
 */
async function getVqdToken(query) {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images&iax=images`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 10000
  });

  const html = response.data;
  if (typeof html !== 'string') return null;

  const vqdMatch = html.match(/vqd=['"]?([\d-]+)['"]?/i) ||
                   html.match(/vqd=([\d-]+)/i) ||
                   html.match(/vqd=['"]?([^'"&\s]+)['"]?/i);

  return vqdMatch ? vqdMatch[1] : null;
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
      console.warn('DuckDuckGo provider: Could not extract vqd token');
      return [];
    }

    const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      timeout: 10000
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
    console.error('DuckDuckGo provider error:', error.message);
    return [];
  }
}

module.exports = { fetchDuckDuckGoWallpapers };
