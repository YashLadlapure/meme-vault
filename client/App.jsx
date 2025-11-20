import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [memes, setMemes] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000';

  // Fetch memes on component mount
  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/memes`);
      setMemes(response.data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMemes([...memes, response.data]);
      setCaption('');
      setImage(null);
    } catch (error) {
      console.error('Error uploading meme:', error);
      alert('Failed to upload meme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Meme Vault</h1>
        <p>Your local meme storage solution</p>
      </header>

      <main className="container">
        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload Meme</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="image">Select Image:</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="caption">Caption:</label>
              <input
                type="text"
                id="caption"
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Enter meme caption"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Meme'}
            </button>
          </form>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section">
          <h2>Meme Gallery ({memes.length})</h2>
          <div className="gallery-grid">
            {memes.length === 0 ? (
              <p className="no-memes">No memes yet. Upload one to get started!</p>
            ) : (
              memes.map((meme) => (
                <div key={meme.id} className="meme-card">
                  <img
                    src={meme.imageUrl}
                    alt={meme.caption}
                    className="meme-image"
                  />
                  <div className="meme-info">
                    <p className="meme-caption">{meme.caption}</p>
                    <small className="meme-date">
                      {new Date(meme.uploadedAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
