import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { memeAPI } from '../utils/api';
import Navbar from './Navbar';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      const data = await memeAPI.getMemes();
      setMemes(data.memes || []);
    } catch (err) {
      setError('Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeme = async (id) => {
    if (!window.confirm('Delete this meme?')) return;
    try {
      await memeAPI.deleteMeme(id);
      setMemes(memes.filter(m => m._id !== id));
    } catch (err) {
      setError('Failed to delete meme');
    }
  };

  const filteredMemes = memes.filter(m => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <div><h1>👋 Welcome, {user?.username}!</h1><p>Your personal meme collection</p></div>
          <div className="header-stats"><div className="stat-box"><span className="stat-number">{memes.length}</span><span className="stat-label">Memes</span></div></div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="dashboard-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search your memes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : memes.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">😨</div><p>No memes yet. Start uploading!</p></div>
        ) : (
          <div className="meme-gallery">
            {filteredMemes.map(meme => (
              <div key={meme._id} className="meme-item">
                <img src={meme.imageUrl || meme.image} alt={meme.title} className="meme-image" />
                <div className="meme-info"><h3>{meme.title}</h3><p>{meme.description}</p></div>
                <button className="delete-btn" onClick={() => handleDeleteMeme(meme._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
