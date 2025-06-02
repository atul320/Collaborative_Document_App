const express = require('express');
const router = express.Router();
const { 
  getChats, 
  getChatById, 
  createChat, 
  createGroupChat, 
  sendMessage 
} = require('../controllers/chat');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getChats);
router.get('/:id', authenticate, getChatById);
router.post('/', authenticate, createChat);
router.post('/group', authenticate, createGroupChat);
router.post('/:id/messages', authenticate, sendMessage);

module.exports = router;