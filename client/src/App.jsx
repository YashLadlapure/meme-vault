import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';
const App = () => {
  const [memes, setMemes] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

const API_URL = 'http://localhost:5001';

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/memes`);
      setMemes(response.data);
    } catch (error) {
      setError('Failed to fetch memes. Make sure backend is running!');
      console.error('Error fetching memes:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!image) {
      setError('Please select an image');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setMemes([response.data, ...memes]);
      setCaption('');
      setImage(null);
      setPreview(null);
      setSuccess('✅ Meme uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to upload meme. Please try again.');
      console.error('Error uploading meme:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

const handleDelete = async (id) => {
  if (window.confirm('Delete this meme?')) {
    try {
      // Call the backend API to delete
      await axios.delete(`${API_URL}/api/memes/${id}`);
      
      // Update local state only after successful deletion
      setMemes(memes.filter(m => m._id !== id));
      setSuccess('✅ Meme deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete meme. Please try again.');
      console.error('Error deleting meme:', error);
    }
  }
};



const filteredMemes = memes.filter(meme =>
  (meme.caption || '').toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">🎬 Meme Vault</h1>
          <p className="subtitle">Your Local Meme Storage Solution</p>
          <div className="stats">
            <span className="stat-item">📸 {memes.length} Memes</span>
            <span className="stat-item">💾 Local Storage</span>
            <span className="stat-item">🚀 MERN Stack</span>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Upload Section */}
        <section className="upload-section">
          <h2>📤 Upload Meme</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="image-preview-container">
              {preview ? (
                <div className="preview">
                  <img src={preview} alt="Preview" className="preview-img" />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="file-input-label">
                  <div className="file-input-box">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">Click to select or drag image here</span>
                    <span className="upload-subtext">Max 10MB</span>
                  </div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </label>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="caption">✍️ Caption:</label>
              <textarea
                id="caption"
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Add a witty caption..."
                className="caption-input"
                maxLength={200}
              />
              <div className="char-count">{caption.length}/200</div>
            </div>

            {loading && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="upload-btn">
              {loading ? `Uploading ${uploadProgress}%...` : '🚀 Upload Meme'}
            </button>
          </form>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section">
          <div className="gallery-header">
            <h2>📷 Meme Gallery ({filteredMemes.length})</h2>
            <input
              type="text"
              placeholder="🔍 Search memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredMemes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">😴</span>
              <p>No memes yet. Be the first to upload one!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredMemes.map((meme) => (
               <div key={meme._id} className="meme-card">
                  <div className="meme-image-container">
                    <img
  src={`${API_URL}${meme.imageUrl}`} 
  alt={meme.caption}
  className="meme-image"
  loading="lazy"
/>
                    <div className="meme-overlay">
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(meme._id)}
                        title="Delete meme"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="meme-info">
                    <p className="meme-caption">{meme.caption}</p>
                    <small className="meme-date">
                      📅 {new Date(meme.uploadedAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Built with ❤️ using MERN Stack | Local Storage Edition</p>
      </footer>
    </div>
  );
};

export default App;
