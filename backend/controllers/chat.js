const Chat = require('../models/Chat');
const User = require('../models/User');
const createError = require('http-errors');

const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'username')
    .populate('messages.sender', 'username')
    .sort({ 'messages.timestamp': -1 });
    
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user.id
    })
    .populate('participants', 'username')
    .populate('messages.sender', 'username');
    
    if (!chat) throw createError.NotFound('Chat not found');
    
    res.json(chat);
  } catch (error) {
    next(error);
  }
};

const createChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      isGroup: false
    });
    
    if (existingChat) {
      return res.json(existingChat);
    }
    
    const chat = new Chat({
      participants: [req.user.id, participantId]
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  try {
    const { name, participants } = req.body;
    
    const chat = new Chat({
      participants: [...participants, req.user.id],
      isGroup: true,
      groupName: name,
      groupAdmin: req.user.id
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.id,
        participants: req.user.id
      },
      {
        $push: {
          messages: {
            sender: req.user.id,
            content
          }
        }
      },
      { new: true }
    )
    .populate('messages.sender', 'username');
    
    if (!chat) throw createError.NotFound('Chat not found');
    
    res.json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    next(error);
  }
};

const sendChatRequest = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    
    await User.findByIdAndUpdate(recipientId, {
      $addToSet: {
        pendingRequests: {
          user: req.user.id,
          status: 'pending'
        }
      }
    });
    
    res.json({ message: 'Chat request sent' });
  } catch (error) {
    next(error);
  }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { requestId, action } = req.body; 
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { pendingRequests: { _id: requestId } }
      },
      { new: true }
    );
    
    if (action === 'accept') {
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { contacts: request.user }
      });
      await User.findByIdAndUpdate(request.user, {
        $addToSet: { contacts: req.user.id }
      });
    }
    
    res.json({ message: `Request ${action}ed` });
  } catch (error) {
    next(error);
  }
};

const shareNoteInChat = async (req, res, next) => {
  try {
    const { chatId, noteId } = req.body;
    
    const [chat, note] = await Promise.all([
      Chat.findOne({
        _id: chatId,
        participants: req.user.id
      }),
      Note.findOne({
        _id: noteId,
        $or: [
          { owner: req.user.id },
          { sharedWith: req.user.id }
        ]
      })
    ]);
    
    if (!chat || !note) throw createError.NotFound('Chat or note not found');
    
    io.to(`chat_${chatId}`).emit('chat:note_shared', {
      sharedBy: req.user.id,
      noteId: note._id,
      title: note.title
    });
    
    res.json({ message: 'Note shared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  getChatById,
  createChat,
  createGroupChat,
  sendMessage,
  shareNoteInChat,
  sendChatRequest,
  respondToRequest
};