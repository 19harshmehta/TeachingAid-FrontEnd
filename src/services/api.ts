
import axios from 'axios';

const BASE_URL = 'http://localhost:9595';

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
    api.post('/api/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};

export const pollAPI = {
  create: (question: string, options: string[]) =>
    api.post('/api/poll/create', { question, options }),
  
  getMyPolls: () =>
    api.get('/api/poll/mypolls'),
  
  relaunch: (pollId: string) =>
    api.post('/api/poll/relaunch', { pollId }),
  
  getPollByCode: (code: string) =>
    api.get(`/api/poll/${code}`),
  
  getPollResults: (code: string) =>
    api.get(`/api/poll/results/${code}`),
  
  vote: (code: string, optionIndex: number, fingerprint: string) =>
    api.post('/api/poll/vote', { code, optionIndex, fingerprint }),
};

export default api;
