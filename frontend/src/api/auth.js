import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'api';

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials, {
    withCredentials: true,
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const logout = async () => {
  await axios.post(`${API_URL}/auth/logout`, {}, {
    withCredentials: true,
  });
};

export const getAuthHeader = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))?.split('=')[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
};
// src/api/notes.js
export const updateNote = async (noteId, data) => {
  return axios.put(`${API_URL}/notes/${noteId}`, data, {
    withCredentials: true, // ✅ critical
  });
};


export const checkAuth = async () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))?.split('=')[1];

  if (!token) return { user: null };

  try {
    const user = jwtDecode(token);
    return { user };
  } catch {
    return { user: null };
  }
};

export const getCurrentUser = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))?.split('=')[1];

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
