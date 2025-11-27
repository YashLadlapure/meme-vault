const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://meme-vault-x46t.vercel.app';

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
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
  uploadMeme: (title, description, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file); // Note: backend expects 'image', not 'file'

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/api/memes`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }
      return res.json();
    });
  },

  getMemes: () => apiCall('/api/memes'),

  deleteMeme: (id) => apiCall(`/api/memes/${id}`, { method: 'DELETE' }),

  updateMeme: (id, data) => apiCall(`/api/memes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
