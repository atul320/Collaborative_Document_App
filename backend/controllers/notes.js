const mongoose = require('mongoose');
const Note = require('../models/Note');
const createError = require('http-errors');

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = new Note({
      title,
      content,
      owner: req.user.id
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('owner', 'username')
      .populate('sharedWith', 'username');

    res.json(notes);
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const noteId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw createError.BadRequest('Invalid note ID format');
    }

    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id }
      ]
    })
      .populate('owner', 'username')
      .populate('sharedWith', 'username')
      .populate('comments.user', 'username');

    if (!note) throw createError.NotFound('Note not found');

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const MAX_RETRIES = 3;

const updateNote = async (req, res, next) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { title, content, labels, sharedWith, archived, pinned } = req.body;
      const { id } = req.params;
      const userId = req.user.id;

      const originalNote = await Note.findById(id).session(session);
      if (!originalNote) throw createError.NotFound('Note not found');

      if (
        !originalNote.owner.equals(userId) &&
        !originalNote.sharedWith.some((uid) => uid.equals(userId))
      ) {
        throw createError.Forbidden('Not authorized');
      }

      const updateFields = {};
      const changedFields = [];

      if (title !== undefined) {
        updateFields.title = title;
        changedFields.push('title');
      }
      if (content !== undefined) {
        updateFields.content = content;
        changedFields.push('content');
      }
      if (labels !== undefined) {
        updateFields.labels = labels;
        changedFields.push('labels');
      }
      if (sharedWith !== undefined) {
        updateFields.sharedWith = sharedWith;
        changedFields.push('sharedWith');
      }
      if (archived !== undefined) {
        updateFields.archived = archived;
        changedFields.push('archived');
      }
      if (pinned !== undefined) {
        updateFields.pinned = pinned;
        changedFields.push('pinned');
      }

      updateFields.updatedAt = new Date();

      const historyEntry = {
        user: userId,
        action: 'update',
        changedFields,
        previousValues: {
          title: originalNote.title,
          content: originalNote.content,
          labels: originalNote.labels,
          sharedWith: originalNote.sharedWith,
          archived: originalNote.archived,
          pinned: originalNote.pinned,
        },
        timestamp: new Date(),
      };

      // Apply updates and save
      Object.assign(originalNote, updateFields);
      originalNote.history.push(historyEntry);
      await originalNote.save({ session });

      // Re-fetch with populated fields
      const updatedNote = await Note.findById(id)
        .populate('owner sharedWith', 'username email')
        .session(session);

      await session.commitTransaction();
      session.endSession();

      // Emit socket event if needed
      if (changedFields.length > 0 && req.io) {
        req.io.to(`note_${id}`).emit('note:updated', {
          noteId: id,
          updatedBy: userId,
          changes: changedFields,
          updatedAt: updatedNote.updatedAt,
        });
      }

      return res.json(updatedNote);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      const isWriteConflict =
        error?.errorLabels?.includes('TransientTransactionError') ||
        error?.message?.includes('Write conflict');

      if (isWriteConflict) {
        retries++;
        await new Promise((res) => setTimeout(res, 100 * retries)); // Exponential backoff
        continue; // Retry
      }

      return next(error); // Non-retryable error
    }
  }

  // If all retries fail
  return next(createError(500, 'Could not complete update due to write conflicts, please try again later.'));
};





const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!note) throw createError.NotFound('Note not found');

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const bulkUpdateNotes = async (req, res, next) => {
  try {
    const { noteIds, updates } = req.body;

    const result = await Note.bulkWrite([
      {
        updateMany: {
          filter: {
            _id: { $in: noteIds },
            $or: [
              { owner: req.user.id },
              { sharedWith: req.user.id }
            ]
          },
          update: {
            $set: updates,
            $push: {
              history: {
                user: req.user.id,
                action: 'bulk_update'
              }
            }
          }
        }
      }
    ]);

    res.json({ updatedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};


const shareNote = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      {
        $addToSet: { sharedWith: userId },
        $push: {
          history: {
            user: req.user.id,
            action: `shared with user ${userId}`
          }
        }
      },
      { new: true }
    );

    if (!note) throw createError.NotFound('Note not found');

    res.json(note);
  } catch (error) {
    next(error);
  }
};




module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  bulkUpdateNotes,
  shareNote
};