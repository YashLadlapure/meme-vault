// src/utils/api.js

// No trailing slash
const API_BASE_URL =
import.meta.env.VITE_API_URL || 'https://meme-vault-x46t.vercel.app/api'
const buildUrl = (endpoint) =>
  `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

// Generic JSON helper
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(endpoint), {
    ...options,
    headers,
  });

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Non-JSON response from API:', text);
      throw new Error('Server returned invalid (non-JSON) response');
    }
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
};

export const authAPI = {
  register: (username, email, password) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const memeAPI = {
  uploadMeme: (title, category, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    // MUST match upload.single('image')
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(buildUrl('/api/memes'), {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (res) => {
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Non-JSON response from upload:', text);
          throw new Error('Server returned invalid (non-JSON) response');
        }
      }
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }
      return data;
    });
  },

  getMemes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/api/memes${query ? `?${query}` : ''}`);
  },

  deleteMeme: (id) =>
    apiCall(`/api/memes/${id}`, { method: 'DELETE' }),

  updateMeme: (id, data) =>
    apiCall(`/api/memes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
