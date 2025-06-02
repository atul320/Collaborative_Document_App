const Note = require('../models/Note');

module.exports = (io, socket) => {
  const handleJoinNote = async ({ noteId }) => {
    try {
      const note = await Note.findOne({
        _id: noteId,
        $or: [
          { owner: socket.user.id },
          { sharedWith: socket.user.id }
        ]
      });
      
      if (!note) return socket.emit('note:error', 'Note not found');
      
      socket.join(`note_${noteId}`);
      socket.emit('note:joined', { noteId });
    } catch (error) {
      socket.emit('note:error', error.message);
    }
  };

  const handleUpdateNote = async ({ noteId, updates }) => {
    try {
      const note = await Note.findOneAndUpdate(
        {
          _id: noteId,
          $or: [
            { owner: socket.user.id },
            { sharedWith: socket.user.id }
          ]
        },
        {
          ...updates,
          $push: {
            history: {
              user: socket.user.id,
              action: 'update'
            }
          }
        },
        { new: true }
      );
      
      if (!note) return socket.emit('note:error', 'Note not found');
      
      io.to(`note_${noteId}`).emit('note:updated', note);
    } catch (error) {
      socket.emit('note:error', error.message);
    }
  };

  socket.on('note:join', handleJoinNote);
  socket.on('note:update', handleUpdateNote);
};