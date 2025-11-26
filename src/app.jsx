import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';

const API_URL = '/api';

const Loader = () => (
  <div style={{ textAlign: 'center', padding: '50px 0' }}>
    <span style={{ fontSize: '2.6em', color: 'var(--primary)' }}>⏳</span>
    <div style={{ marginTop: 12, color: 'var(--primary-dark)' }}>Loading...</div>
  </div>
);

const App = () => {
  const [memes, setMemes] = useState([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => { fetchMemes(); }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const fetchMemes = async () => {
    try {
      setError('');
      setInitialLoad(true);
      const response = await axios.get(`${API_URL}/memes`);
      setMemes(response.data);
    } catch { setError('Failed to fetch memes.'); }
    finally { setInitialLoad(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!image) { setError('Please select an image'); return; }
    if (!title.trim()) { setError('Please add a caption/title'); return; }
    setLoading(true); setUploadProgress(0);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    try {
      const response = await axios.post(`${API_URL}/memes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
      });
      setMemes([response.data, ...memes]);
      setTitle(''); setImage(null); setPreview(null);
      setSuccess('Meme uploaded!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to upload meme.'); }
    finally { setLoading(false); setUploadProgress(0); }
  };

  const handleLike = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/memes/${id}/like`);
      setMemes(memes.map(m => m.id === id ? { ...m, likes: response.data.likes } : m));
    } catch { console.error('Failed to like meme'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this meme?')) {
      try {
        await axios.delete(`${API_URL}/memes/${id}`);
        setMemes(memes.filter(m => m.id !== id));
        setSuccess('Meme deleted!');
        setTimeout(() => setSuccess(''), 3000);
      } catch { setError('Failed to delete meme.'); }
    }
  };

  const filteredMemes = memes.filter(m => (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <button className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <h1 className="title">🎬 Meme Vault</h1>
          <p className="subtitle">Your Local Meme Storage Solution (Full Stack)</p>
          <div className="stats"><div className="stat-item">📸 {memes.length} Memes</div></div>
        </div>
      </header>

      <div className="container">
        <section className="upload-section">
          <h2>Upload Meme</h2>
          <form className="upload-form" onSubmit={handleUpload}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <label className="file-input-label">
              <div className="file-input-box">
                <span className="upload-icon">📁</span>
                <span className="upload-text">Choose File</span>
                <span className="upload-subtext">Image files (max 10MB)</span>
                <input type="file" accept="image/*" className="file-input" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
            </label>
            {preview && (
              <div className="image-preview-container">
                <div className="preview">
                  <img className="preview-img" src={preview} alt="Preview" />
                  <button type="button" className="remove-btn" onClick={() => { setImage(null); setPreview(null); }}>×</button>
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="caption">Caption/Title</label>
              <textarea id="caption" className="caption-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a witty caption..." maxLength={200} required />
              <span className="char-count">{title.length}/200</span>
            </div>
            {loading && <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }}>{uploadProgress}%</div></div>}
            <button type="submit" className="upload-btn" disabled={loading}>{loading ? 'Uploading...' : '🚀 Upload Meme'}</button>
          </form>
        </section>

        <section className="gallery-section">
          <div className="gallery-header">
            <h2>Meme Gallery</h2>
            <input className="search-input" type="text" placeholder="🔍 Search memes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="gallery-grid">
            {initialLoad ? <Loader /> : filteredMemes.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">😶</span><p>No memes yet. Be the first to upload one!</p></div>
            ) : (
              filteredMemes.map(meme => (
                <div className="meme-card" key={meme.id}>
                  <div className="meme-image-container">
                    <img className="meme-image" src={meme.imageUrl} alt={meme.title} />
                    <div className="meme-overlay">
                      <button className="delete-btn" onClick={() => handleDelete(meme.id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="meme-info">
                    <p className="meme-caption">{meme.title}</p>
                    <div className="meme-footer">
                      <span className="meme-date">📅 {new Date(meme.uploadDate).toLocaleDateString()}</span>
                      <button className="like-btn" onClick={() => handleLike(meme.id)}>
                        ❤️ {meme.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>Built with ❤️ by <strong>Yash Santosh Ladlapure</strong> | MIT-WPU<br />Hosted Free on Vercel</p>
      </footer>
    </div>
  );
};

export default App;
