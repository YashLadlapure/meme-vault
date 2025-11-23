const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config(); // Loads .env variables

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

// CORS setup: Allow frontend requests from deployed domain
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// In-memory memes array (use real DB in production)
let memes = [];

// GET - List all memes
app.get('/api/memes', (req, res) => res.json(memes));

// POST - Upload meme
app.post('/api/memes', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { title, category } = req.body;
  const newMeme = {
    id: Date.now().toString(),
    title: title || 'Untitled Meme',
    category: category || 'general',
    imageUrl: req.file.path,
    publicId: req.file.filename,
    uploadDate: new Date().toISOString(),
  };
  memes.unshift(newMeme);
  res.status(201).json(newMeme);
});

// DELETE - Remove meme
app.delete('/api/memes/:id', async (req, res) => {
  const { id } = req.params;
  const index = memes.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Meme not found' });
  const meme = memes[index];
  // Delete image from Cloudinary
  if (meme.publicId) await cloudinary.uploader.destroy(meme.publicId);
  memes.splice(index, 1);
  res.json({ message: 'Meme deleted successfully', meme });
});

// Simple API status endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Meme Vault API is running!',
    endpoints: {
      'GET /api/memes': 'List all memes',
      'POST /api/memes': 'Upload meme',
      'DELETE /api/memes/:id': 'Delete meme',
    },
  });
});

module.exports = app;
