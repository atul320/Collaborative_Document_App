// src/api/notes.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'api';

export const getNotes = async () => {
  const response = await axios.get(`${API_URL}/notes`, {
    withCredentials: true,
  });
  return response.data;
};

export const getNoteById = async (id) => {
  const response = await axios.get(`${API_URL}/notes/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await axios.post(`${API_URL}/notes`, noteData, {
    withCredentials: true,
  });
  return response.data;
};

export const updateNote = async (id, updates) => {
  const response = await axios.put(`${API_URL}/notes/${id}`, updates, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await axios.delete(`${API_URL}/notes/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

export const shareNote = async (id, userId) => {
  const response = await axios.post(`${API_URL}/notes/${id}/share`, { userId }, {
    withCredentials: true,
  });
  return response.data;
};
