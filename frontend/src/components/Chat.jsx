import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

export const Chat = () => {
  const { user: authUser } = useAuthStore(); // Get user from auth store
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket']
    });
    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for broadcast messages
    socket.on('messageBroadcast', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('messageBroadcast');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !socket || !authUser) return;
    
    const message = {
      sender: authUser.name || authUser.username,
      content: newMsg.trim(),
      timestamp: new Date(),
      userId: authUser._id
    };
    
    // Emit the message to the server
    socket.emit('sendMessage', message);
    setNewMsg('');
  };

  // If user is not logged in, show a message
  if (!authUser) {
    return (
      <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
        <h2>Public Chat Room</h2>
        <p>Please login to join the chat</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Public Chat Room</h2>
      <div style={{ marginBottom: 10 }}>
        Logged in as: <strong>{authUser.name || authUser.username}</strong>
      </div>
      
      <div
        style={{
          border: '1px solid #ccc',
          height: 300,
          overflowY: 'auto',
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <b>{msg.sender}:</b> {msg.content}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        placeholder="Type your message"
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        style={{ width: '80%', padding: 8 }}
      />
      <button
        onClick={handleSend}
        style={{ padding: '8px 16px', marginLeft: 8 }}
      >
        Send
      </button>
    </div>
  );
};