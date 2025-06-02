import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL||'api'

export const getChats = async () => {
  const response = await axios.get(`${API_URL}/chat`, {
    withCredentials: true
  });
  return response.data;
};

export const getChatById = async (id) => {
  const response = await axios.get(`${API_URL}/chat/${id}`, {
    withCredentials: true
  });
  return response.data;
};

export const createChat = async (participantId) => {
  const response = await axios.post(`${API_URL}/chat`, { participantId }, {
    withCredentials: true
  });
  return response.data;
};

export const createGroupChat = async (name, participants) => {
  const response = await axios.post(`${API_URL}/chat/group`, { name, participants }, {
    withCredentials: true
  });
  return response.data;
};