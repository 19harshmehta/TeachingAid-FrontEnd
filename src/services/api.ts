
import axios from 'axios';

const BASE_URL = 'https://teachingaid-backend.onrender.com';

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
  create: (question: string, topic: string, options: string[], allowMultiple: boolean = false) =>
    api.post('/api/poll/create', { question, topic, options, allowMultiple }),
  
  getMyPolls: () =>
    api.get('/api/poll/mypolls'),
  
  relaunch: (pollId: string) =>
    api.post('/api/poll/relaunch', { pollId, resetVotes: true }),
  
  getPollByCode: (code: string) =>
    api.get(`/api/poll/${code}`),
  
  getPollResults: (code: string) =>
    api.get(`/api/poll/results/${code}`),
  
  vote: (code: string, fingerprint: string, optionIndex?: number, optionIndices?: number[]) => {
    const body: any = { code, fingerprint };
    if (optionIndices !== undefined) {
      body.optionIndices = optionIndices;
    } else {
      body.optionIndex = optionIndex;
    }
    return api.post('/api/poll/vote', body);
  },
  
  closePoll: (code: string) =>
    api.put(`/api/poll/${code}/status`, { isActive: false }),
  
  delete: (pollId: string) =>
    api.delete(`/api/poll/${pollId}`),
};

export const folderAPI = {
  create: (name: string, description: string) =>
    api.post('/api/folder', { name, description }),
  
  getAll: () =>
    api.get('/api/folder'),
  
  addPollToFolder: (folderId: string, pollCode: string) =>
    api.post(`/api/folder/${folderId}/polls/${pollCode}`),
  
  getPollsByFolder: (folderId: string) =>
    api.get(`/api/folder/${folderId}/polls`),
};

export default api;
