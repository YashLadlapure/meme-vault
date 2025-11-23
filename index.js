import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './app.css';

const API_URL = 'https://your-vercel-app-url.vercel.app/api'; // <--- your deployed backend

const App = () => {
  const [memes, setMemes] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
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
    } catch (err) {
      setError('Failed to fetch memes. Make sure backend is running!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setError('File size must be less than 10MB');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!image) { setError('Please select an image'); return; }
    if (!title.trim()) { setError('Please add a title'); return; }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('category', category);

    try {
      const response = await axios.post(`${API_URL}/memes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      setMemes([response.data, ...memes]);
      setTitle('');
      setCategory('');
      setImage(null);
      setPreview(null);
      setSuccess('✅ Meme uploaded!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload meme. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meme?')) return;
    try {
      await axios.delete(`${API_URL}/memes/${id}`);
      setMemes(memes.filter(m => m.id !== id));
      setSuccess('✅ Meme deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete meme. Please try again.');
    }
  };

  const filteredMemes = memes.filter(meme =>
    (meme.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    || (meme.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header>
        <h1>🎬 Meme Vault</h1>
        <span>{memes.length} Memes</span>
      </header>
      <form onSubmit={handleUpload}>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {preview && (
          <div>
            <img src={preview} alt="Preview" width={180} />
            <button type="button" onClick={() => { setImage(null); setPreview(null); }}>Remove</button>
          </div>
        )}
        <input
          type="text"
          value={title}
          placeholder="Title"
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          value={category}
          placeholder="Category"
          onChange={e => setCategory(e.target.value)}
        />
        {loading && <div>{uploadProgress}%</div>}
        <button type="submit" disabled={loading}>Upload</button>
      </form>

      <input
        type="text"
        placeholder="🔍 Search memes..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <div className="gallery">
        {filteredMemes.length === 0 ? (
          <div>No memes yet!</div>
        ) : (
          filteredMemes.map(meme => (
            <div key={meme.id} className="meme">
              <img src={meme.imageUrl} alt={meme.title} width={220} />
              <p>{meme.title} <br /><i>{meme.category}</i></p>
              <button onClick={() => handleDelete(meme.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>
      <footer>
        Built with MERN & Cloudinary, Hosted Free
      </footer>
    </div>
  );
};

export default App;
