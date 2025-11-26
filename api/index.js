const express = require('express');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'meme-vault',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage });

// CORS setup
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// In-memory memes array
let memes = [];

// GET - List all memes
app.get('/api/memes', (req, res) => res.json(memes));

// POST - Upload meme
app.post('/api/memes', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to upload image', details: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const { title, category } = req.body;
    const newMeme = {
      id: Date.now().toString(),
      title: title || 'Untitled Meme',
      category: category || 'general',
      imageUrl: req.file.path,
      publicId: req.file.filename,
      uploadDate: new Date().toISOString(),
      likes: 0
    };
    memes.unshift(newMeme);
    res.status(201).json(newMeme);
  });
});

// POST - Like a meme
app.post('/api/memes/:id/like', (req, res) => {
  const { id } = req.params;
  const meme = memes.find((m) => m.id === id);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });
  meme.likes = (meme.likes || 0) + 1;
  res.json({ id: meme.id, likes: meme.likes });
});

// DELETE - Remove meme
app.delete('/api/memes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = memes.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Meme not found' });
    const meme = memes[index];
    if (meme.publicId) await cloudinary.uploader.destroy(meme.publicId);
    memes.splice(index, 1);
    res.json({ message: 'Meme deleted successfully', meme });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete meme', details: err.message });
  }
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Meme Vault API is running!',
    endpoints: {
      'GET /api/memes': 'List all memes',
      'POST /api/memes': 'Upload meme',
      'POST /api/memes/:id/like': 'Like a meme',
      'DELETE /api/memes/:id': 'Delete meme',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

module.exports = app;
