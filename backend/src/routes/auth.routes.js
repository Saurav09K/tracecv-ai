const express = require('express');
const { githubLogin, githubCallback,getMe } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', getMe);

module.exports = router;