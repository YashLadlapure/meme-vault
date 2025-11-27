const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const authAPI = {
  register: (username, email, password) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const memeAPI = {
  uploadMeme: (title, description, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/memes`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => res.json());
  },

  getMemes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/memes${query ? '?' + query : ''}`);
  },

  deleteMeme: (id) =>
    apiCall(`/memes/${id}`, { method: 'DELETE' }),

  updateMeme: (id, data) =>
    apiCall(`/memes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
