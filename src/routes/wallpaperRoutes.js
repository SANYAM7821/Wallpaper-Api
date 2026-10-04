const express = require('express');
const router = express.Router();
const { searchWallpapers } = require('../controllers/wallpaperController');

// GET /api/wallpapers
router.get('/', searchWallpapers);

module.exports = router;
