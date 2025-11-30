import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';

const FolderView = () => {
  const { folderId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [memes, setMemes] = useState([]);
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchMemes();
  }, [token, folderId]);

  const fetchMemes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}/memes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMemes(data.memes);
        setFolder(data.folder);
      } else {
        setError('Failed to load folder');
      }
    } catch (err) {
      setError('Error loading memes');
    } finally {
      setLoading(false);
    }
  };

  const deleteMeme = async (memeId) => {
    if (!window.confirm('Delete this meme?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/memes/${memeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMemes(memes.filter(m => m._id !== memeId));
      }
    } catch (err) {
      console.error('Failed to delete meme');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-purple-400 hover:text-purple-300 mb-4">← Back to Dashboard</button>
          <h1 className="text-4xl font-bold text-white">{folder?.name}</h1>
          {folder?.description && <p className="text-gray-300 mt-2">{folder.description}</p>}
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {memes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No memes in this folder yet</p>
            <button onClick={() => navigate('/upload')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Add Meme</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map(meme => (
              <div key={meme._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition">
                <img src={meme.imageUrl} alt={meme.title} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{meme.title}</h3>
                  {meme.description && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{meme.description}</p>}
                  <button onClick={() => deleteMeme(meme._id)} className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderView;
