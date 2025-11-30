import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchFolders();
  }, [token, navigate]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (err) {
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) {
      setError('Folder name is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription,
          color: newFolderColor
        })
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders([newFolder, ...folders]);
        setNewFolderName('');
        setNewFolderDescription('');
        setNewFolderColor('#3B82F6');
        setShowCreateModal(false);
        setError('');
      }
    } catch (err) {
      setError('Failed to create folder');
    }
  };

  const deleteFolder = async (folderId) => {
    if (!window.confirm('Delete this folder and all memes in it?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFolders(folders.filter(f => f._id !== folderId));
      }
    } catch (err) {
      setError('Failed to delete folder');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Meme Collections</h1>
            <p className="text-gray-300 mt-2">Welcome, {user?.username}!</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
            + New Folder
          </button>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Folder</h2>
              <form onSubmit={createFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Folder Name *</label>
                  <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., Funny Memes" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea value={newFolderDescription} onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Add a description (optional)" rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="flex gap-2">
                    {colors.map(color => (
                      <button key={color} type="button" onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded-full ${newFolderColor === color ? 'ring-2 ring-offset-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {folders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-300 text-lg mb-4">No folders yet. Create one to get started!</p>
            <button onClick={() => setShowCreateModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Create First Folder</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map(folder => (
              <div key={folder._id} onClick={() => navigate(`/folder/${folder._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden group">
                <div className="h-32" style={{ backgroundColor: folder.color }}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition">{folder.name}</h3>
                  {folder.description && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{folder.description}</p>}
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/folder/${folder._id}`); }}
                      className="text-purple-600 hover:text-purple-700 font-semibold">View →</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder._id); }}
                      className="text-red-500 hover:text-red-700">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
