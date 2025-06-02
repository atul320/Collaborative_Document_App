const express = require('express');
const router = express.Router();
const User = require('../models/User'); // adjust path if needed

// GET /api/users/search?username=xyz
router.get('/search', async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username query required' });

    const users = await User.find({
      username: { $regex: username, $options: 'i' }  // case-insensitive search
    })
      .select('_id username') // only return id and username
      .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
});
// Add this to your existing user routes
router.get('/name/:name', async (req, res) => {
  try {
    // Case-insensitive search for name or username
    const user = await User.findOne({
      $or: [
        { name: { $regex: new RegExp(req.params.name, 'i') } },
        { username: { $regex: new RegExp(req.params.name, 'i') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
