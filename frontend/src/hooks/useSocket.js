import { useEffect, useState } from 'react';
import { initSocket } from '../api/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = initSocket();

    if (!socketInstance) {
      console.warn('Socket not initialized - no token or config issue.');
      setSocket(null);
      return;
    }

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected with id:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server disconnected the socket, try reconnect
        socketInstance.connect();
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return socket;
};
