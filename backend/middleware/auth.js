const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) throw createError.Unauthorized('Access denied. No token provided.');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError.Unauthorized('Invalid or expired token'));
  }
};

const socketAuthenticate = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
};

module.exports = { authenticate, socketAuthenticate };