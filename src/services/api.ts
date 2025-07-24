
import axios from 'axios';

const BASE_URL = 'http://localhost:6000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
};

export const pollAPI = {
  create: (title: string, options: string[]) =>
    api.post('/api/poll/create', { title, options }),
  
  getMyPolls: () =>
    api.get('/api/poll/mypolls'),
  
  relaunch: (pollId: string) =>
    api.post('/api/poll/relaunch', { pollId }),
  
  getPollByCode: (code: string) =>
    api.get(`/api/poll/${code}`),
  
  vote: (pollId: string, optionIndex: number, voterId: string) =>
    api.post('/api/poll/vote', { pollId, optionIndex, voterId }),
};

export default api;
