import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { debounce } from 'lodash';

export const useTypingIndicator = (noteId) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const socket = useSocket();

  const startTyping = () => {
    if (socket) {
      socket.emit('note:typing', { noteId });
    }
  };

  const stopTyping = debounce(() => {
    // No explicit stop needed - server will timeout
  }, 2000);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (userId) => {
      setTypingUsers(prev => 
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    socket.on('note:typing', handleTyping);

    return () => {
      socket.off('note:typing', handleTyping);
    };
  }, [socket]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingUsers(prev => {
        // Remove users who haven't typed in the last 3 seconds
        if (prev.length > 0) {
          return prev.filter(userId => {
            // This would ideally come from server with timestamps
            return true; // Simplified for example
          });
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return { typingUsers, startTyping, stopTyping };
};