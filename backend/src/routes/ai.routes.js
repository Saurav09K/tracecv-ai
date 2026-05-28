const express = require('express');
const { generateResume } = require('../controllers/ai.controller');
const requireAuth = require('../middlewares/auth.middleware');
const aiRateLimiter = require('../middlewares/aiRateLimiter');

const router = express.Router();

router.post('/generate', requireAuth, aiRateLimiter, generateResume);

module.exports = router;