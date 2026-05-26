const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next(); 
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = requireAuth;