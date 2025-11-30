import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';

const Upload = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
   const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) navigate('/login');
    fetchFolders();
  }, [token]);

  const fetchFolders = async () => {
    try {
      const response = await fetch`${API_BASE_URL}/api/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (err) {
      console.error('Failed to fetch folders');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !selectedFolder || !title) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('folderId', selectedFolder);
    formData.append('description', description);

    setLoading(true);
    try {
      const response = await fetch`${API_BASE_URL}/api/memes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setSuccess('Meme uploaded successfully!');
        setImage(null);
        setTitle('');
        setDescription('');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError('Error uploading meme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Meme</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Share your meme with your collection</p>

          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Folder *</label>
              <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white">
                <option value="">Choose a folder...</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meme Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meme title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)" rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
                className="hidden" id="imageInput" />
              <label htmlFor="imageInput" className="cursor-pointer">
                <div className="text-gray-600 dark:text-gray-300">
                  {image ? (
                    <div>
                      <p className="font-semibold text-lg text-purple-600">{image.name}</p>
                      <p className="text-sm">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold">Click to upload or drag and drop</p>
                      <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition">
              {loading ? 'Uploading...' : 'Upload Meme'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
