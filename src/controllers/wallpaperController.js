const { aggregateWallpapers } = require('../services/wallpaperAggregator');
const { wallpaperCache } = require('../utils/cache');

/**
 * Controller to handle wallpaper search requests
 * GET /api/wallpapers?query={search_term}&limit={limit}
 * GET /api/wallpapers?q={search_term}&limit={limit}
 */
async function searchWallpapers(req, res) {
  const startTime = Date.now();
  try {
    const rawQuery = req.query.query || req.query.q;

    if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'query' or 'q' is required (e.g. /api/wallpapers?query=gojo wallpaper)"
      });
    }

    const searchQuery = rawQuery.trim();
    const isCached = wallpaperCache.has(searchQuery);

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 30;
    } else if (limit > 100) {
      limit = 100;
    }

    const wallpapers = await aggregateWallpapers(searchQuery, { limit });
    const responseTimeMs = Date.now() - startTime;

    console.log(`[Wallpaper Search] query="${searchQuery}" count=${wallpapers.length} cached=${isCached} time=${responseTimeMs}ms`);

    res.setHeader('X-Response-Time', `${responseTimeMs}ms`);
    res.setHeader('X-Cache-Hit', isCached ? 'HIT' : 'MISS');

    return res.status(200).json({
      success: true,
      query: searchQuery,
      count: wallpapers.length,
      cached: isCached,
      responseTimeMs,
      data: wallpapers
    });
  } catch (error) {
    console.error('Error handling wallpaper search:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while fetching wallpapers'
    });
  }
}

module.exports = {
  searchWallpapers
};
