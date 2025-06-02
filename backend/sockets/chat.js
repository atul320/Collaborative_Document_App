const Chat = require('../models/Chat');

module.exports = (io, socket) => {
  const handleJoinChat = async ({ chatId }) => {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user.id
      });
      
      if (!chat) return socket.emit('chat:error', 'Chat not found');
      
      socket.join(`chat_${chatId}`);
      socket.emit('chat:joined', { chatId });
    } catch (error) {
      socket.emit('chat:error', error.message);
    }
  };

  const handleSendMessage = async ({ chatId, content }) => {
    try {
      const chat = await Chat.findOneAndUpdate(
        {
          _id: chatId,
          participants: socket.user.id
        },
        {
          $push: {
            messages: {
              sender: socket.user.id,
              content
            }
          }
        },
        { new: true }
      ).populate('messages.sender', 'username');
      
      if (!chat) return socket.emit('chat:error', 'Chat not found');
      
      const newMessage = chat.messages[chat.messages.length - 1];
      
      io.to(`chat_${chatId}`).emit('chat:message', newMessage);
    } catch (error) {
      socket.emit('chat:error', error.message);
    }
  };

  const handleTyping = ({ chatId }) => {
    socket.to(`chat_${chatId}`).emit('chat:typing', { 
      userId: socket.user.id,
      chatId 
    });
  };

  socket.on('chat:join', handleJoinChat);
  socket.on('chat:message', handleSendMessage);
  socket.on('chat:typing', handleTyping);
};