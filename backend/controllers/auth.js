const User = require('../models/User');
const createError = require('http-errors');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw createError.Conflict('Username or email already exists');
    }
    
    const user = new User({ username, email, password });
    await user.save();
    
    const token = user.generateAuthToken();
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({ 
      user: { 
        id: user._id, 
        username: user.username,
        email: user.email
      } 
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw createError.Unauthorized('Invalid credentials');
    }
    
    const token = user.generateAuthToken();
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username,
        email: user.email
      } 
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const checkAuth = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, logout, checkAuth };