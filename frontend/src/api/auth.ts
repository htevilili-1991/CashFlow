import axios from 'axios';
import type { AuthTokens, User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const response = await api.post('/token/', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await api.post('/register/', { username, email, password });
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<AuthTokens> => {
    const response = await api.post('/token/refresh/', { refresh });
    return response.data;
  },
};

export default api;
