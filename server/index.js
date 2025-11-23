const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

const app = express();
const PORT = 5001;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meme-vault',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Disable browser caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// In-memory memes storage (since serverless doesn't support file system)
let memes = [];

// Helper: Get All Memes
const getAllMemes = () => {
  return memes;
};

// Helper: Save New Meme
const saveMeme = (meme) => {
  memes.unshift(meme);
};

// Helper: Delete Meme
const deleteMemeById = (id) => {
  const index = memes.findIndex(m => m.id === id);
  if (index !== -1) {
    const meme = memes[index];
    memes.splice(index, 1);
    return meme;
  }
  return null;
};

// API Routes

// GET all memes
app.get('/api/memes', (req, res) => {
  try {
    const allMemes = getAllMemes();
    res.json(allMemes);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// POST new meme
app.post('/api/memes', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { title, category } = req.body;
    
    const newMeme = {
      id: Date.now().toString(),
      title: title || 'Untitled Meme',
      category: category || 'general',
      imageUrl: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id for deletion
      uploadDate: new Date().toISOString()
    };

    saveMeme(newMeme);
    res.status(201).json(newMeme);
  } catch (error) {
    console.error('Error uploading meme:', error);
    res.status(500).json({ error: 'Failed to upload meme' });
  }
});

// DELETE meme
app.delete('/api/memes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMeme = deleteMemeById(id);
    
    if (!deletedMeme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    // Delete image from Cloudinary
    if (deletedMeme.publicId) {
      await cloudinary.uploader.destroy(deletedMeme.publicId);
    }

    res.json({ message: 'Meme deleted successfully', meme: deletedMeme });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Meme Vault API', 
    endpoints: {
      'GET /api/memes': 'Get all memes',
      'POST /api/memes': 'Upload new meme',
      'DELETE /api/memes/:id': 'Delete meme by ID'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Meme Vault API running on port ${PORT}`);
  console.log('☁️  Using Cloudinary for image storage');
});

// Export for Vercel
module.exports = app;
