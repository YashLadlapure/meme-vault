import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';

const API_URL = 'https://your-vercel-app-url.vercel.app/api'; // <-- Replace with your actual Vercel backend URL

const App = () => {
  const [memes, setMemes] = useState([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/memes`);
      setMemes(response.data);
    } catch (error) {
      setError('Failed to fetch memes. Make sure backend is running!');
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
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!image) {
      setError('Please select an image');
      return;
    }

    if (!title.trim()) {
      setError('Please add a caption/title');
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to upload meme. Please try again.');
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
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete meme. Please try again.');
      }
    }
  };

  const filteredMemes = memes.filter(meme =>
    (meme.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Meme Vault</h1>
        <p>Your Local Meme Storage Solution (Full Stack)</p>
        <span>📸 {memes.length} Memes</span>
      </header>

      <main>
        <form onSubmit={handleUpload}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div>
              <img src={preview} alt="Preview" style={{ width: 200 }} />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}>Remove</button>
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Add a witty caption..."
            maxLength={200}
          />
          {loading && <div>{uploadProgress}%</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : '🚀 Upload Meme'}
          </button>
        </form>

        <input
          type="text"
          placeholder="🔍 Search memes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="gallery">
          {filteredMemes.length === 0 ? (
            <div>No memes yet. Be the first to upload one!</div>
          ) : (
            filteredMemes.map(meme => (
              <div key={meme.id || meme.publicId} className="meme-card">
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  style={{ width: '100%', borderRadius: 8 }}
                />
                <p>{meme.title}</p>
                <small>
                  📅 {new Date(meme.uploadDate).toLocaleDateString()}
                </small>
                <button onClick={() => handleDelete(meme.id || meme.publicId)}>
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <footer>Built with ❤️ using MERN & Cloudinary | Hosted Free</footer>
    </div>
  );
};

export default App;
