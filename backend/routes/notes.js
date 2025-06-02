const express = require('express');
const router = express.Router();
const { 
  createNote, 
  getNotes, 
  getNoteById, 
  updateNote, 
  deleteNote, 
  bulkUpdateNotes,
  shareNote
} = require('../controllers/notes');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createNote);
router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNoteById);
router.put('/:id', authenticate, updateNote);
router.delete('/:id', authenticate, deleteNote);
router.patch('/bulk-update', authenticate, bulkUpdateNotes);
router.post('/:id/share', authenticate, shareNote);

module.exports = router;