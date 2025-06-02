import { io } from 'socket.io-client';

// Helper to get token from cookies
const getTokenFromCookie = () => {
  const cookies = document.cookie.split('; ').reduce((acc, cookieStr) => {
    const [key, val] = cookieStr.split('=');
    acc[key] = val;
    return acc;
  }, {});

  console.log('Available cookies:', cookies); // Debug: check all cookies on page

  // Adjust 'token' here if your cookie name is different
  return cookies.token || null;
};

let socketInstance = null;

export const initSocket = () => {
  if (!socketInstance) {
    const token = getTokenFromCookie();
    
    if (!token) {
      console.warn('No token found in cookies. Socket will not connect.');
      return null;
    }

    socketInstance = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      auth: { token },  // send token in auth payload for socket auth middleware
    });

    // Optional: listen to connection errors for better debugging
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance) {
    console.warn('Socket not initialized - no token or config issue.');
  }
  return socketInstance;
};
