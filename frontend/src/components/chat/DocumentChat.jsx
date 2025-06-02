import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { Message } from './Message';
import { TypingIndicator } from '../ui/TypingIndicator';

export const DocumentChat = ({ noteId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('chat:join', { chatId: noteId });

    socket.on('chat:message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('chat:typing', ({ userId }) => {
      setTypingUsers(prev => [...prev, userId]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 2000);
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [noteId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('chat:message', {
        chatId: noteId,
        content: newMessage
      });
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      socket.emit('chat:typing', { chatId: noteId });
      setIsTyping(true);
    }
    const timer = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="document-chat">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} currentUser={currentUser} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <TypingIndicator typingUsers={typingUsers} />

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};