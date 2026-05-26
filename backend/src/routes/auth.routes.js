const express = require('express');
const { githubLogin, githubCallback } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

module.exports = router;