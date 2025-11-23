import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';

const API_URL = 'https://your-vercel-app-url.vercel.app/api'; // <-- Change to your actual Vercel backend

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
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setError('');
      setInitialLoad(true);
      const response = await axios.get(`${API_URL}/memes`);
      setMemes(response.data);
    } catch (error) {
      setError('Failed to fetch memes. Make sure backend is running!');
      showToast('❌ Failed to fetch memes!');
    } finally {
      setInitialLoad(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        showToast('❌ Image must be <10MB!');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageChange({ target: { files: [file] } });
  };

  const handleTitleChange = (e) => setTitle(e.target.value);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!image) {
      setError('Please select an image');
      showToast('❌ Select an image!');
      return;
    }
    if (!title.trim()) {
      setError('Please add a caption/title');
      showToast('❌ Add a caption/title!');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);

    try {
      const response = await axios.post(`${API_URL}/memes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setMemes([response.data, ...memes]);
      setTitle('');
      setImage(null);
      setPreview(null);
      setSuccess('✅ Meme uploaded successfully!');
      showToast('✅ Meme uploaded!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to upload meme. Please try again.');
      showToast('❌ Upload failed!');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this meme?')) {
      try {
        await axios.delete(`${API_URL}/memes/${id}`);
        setMemes(memes.filter(m => m.id !== id && m.publicId !== id));
        setSuccess('✅ Meme deleted successfully!');
        showToast('✅ Meme deleted!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete meme. Please try again.');
        showToast('❌ Delete failed!');
      }
    }
  };

  const filteredMemes = memes.filter(meme =>
    (meme.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">🎬 Meme Vault</h1>
          <p className="subtitle">Your Local Meme Storage Solution (Full Stack)</p>
          <div className="stats">
            <div className="stat-item">📸 {memes.length} Memes</div>
          </div>
        </div>
      </header>

      <main className="container">

        <section
          className="upload-section"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <h2>Upload Meme</h2>
          <form className="upload-form" onSubmit={handleUpload}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <label className="file-input-label">
              <div
                className="file-input-box"
                style={{ borderStyle: image ? 'solid' : 'dashed', cursor: 'pointer' }}
              >
                <span className="upload-icon">📁</span>
                <span className="upload-text">
                  {image ? 'Image ready!' : 'Drag & drop or click to choose'}
                </span>
                <span className="upload-subtext">Image files (max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </label>

            {preview && (
              <div className="image-preview-container">
                <div className="preview">
                  <img className="preview-img" src={preview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => { setImage(null); setPreview(null); }}
                  >&times;</button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="caption">Caption/Title</label>
              <input
                id="caption"
                className="caption-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Add a witty caption..."
                maxLength={200}
                required
              />
              <div className="char-count">{title.length}/200</div>
            </div>

            {loading && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button className="upload-btn" type="submit" disabled={loading}>
              {loading ? 'Uploading...' : '🚀 Upload Meme'}
            </button>
          </form>
        </section>

        <section className="gallery-section">
          <div className="gallery-header">
            <h2>Meme Gallery</h2>
            <input
              className="search-input"
              type="text"
              placeholder="🔍 Search memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="gallery-grid">
            {initialLoad ? (
              <Loader />
            ) : filteredMemes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon" role="img" aria-label="empty">😶</span>
                <p>No memes yet. Be the first to upload one!</p>
              </div>
            ) : (
              filteredMemes.map(meme => (
                <div key={meme.id || meme.publicId} className="meme-card">
                  <div className="meme-image-container" style={{ position: 'relative' }}>
                    <img
                      className="meme-image"
                      src={meme.imageUrl}
                      alt={meme.title}
                    />
                    <div className="meme-actions">
                      <button
                        className="delete-btn"
                        style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
                        type="button"
                        onClick={() => handleDelete(meme.id || meme.publicId)}
                      >🗑️</button>
                    </div>
                  </div>
                  <div className="meme-info">
                    <p className="meme-caption">{meme.title}</p>
                    <small className="meme-date">
                      📅 {new Date(meme.uploadDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        Built with ❤️ using MERN & Cloudinary | Hosted Free
      </footer>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary-dark)',
          color: 'white',
          padding: '18px 32px',
          borderRadius: '14px',
          boxShadow: 'var(--shadow)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
