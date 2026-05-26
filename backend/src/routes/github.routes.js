const express = require('express');
const { syncRepositories } = require('../controllers/github.controller');
const requireAuth = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/sync', requireAuth, syncRepositories);

module.exports = router;