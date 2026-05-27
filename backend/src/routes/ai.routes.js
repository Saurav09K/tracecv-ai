const express = require('express');
const { generateResume } = require('../controllers/ai.controller');
const requireAuth = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/generate', requireAuth, generateResume);

module.exports = router;