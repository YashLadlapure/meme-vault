const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meme-vault', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// ============ AUTH ROUTES ============

// POST - Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ MEME ROUTES ============

// In-memory memes array (consider moving to MongoDB later)
let memes = [];

// GET - List all memes
app.get('/api/memes', (req, res) => res.json({ memes }));

// POST - Upload meme (protected)
app.post('/api/memes', authMiddleware, (req, res) => {
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
      likes: 0,
      userId: req.user.userId // Track who uploaded
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

// DELETE - Remove meme (protected, owner only)
app.delete('/api/memes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const index = memes.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Meme not found' });
    
    const meme = memes[index];
    
    // Check if user owns this meme
    if (meme.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this meme' });
    }
    
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
      'POST /api/auth/register': 'Register user',
      'POST /api/auth/login': 'Login user',
      'GET /api/memes': 'List all memes',
      'POST /api/memes': 'Upload meme (protected)',
      'POST /api/memes/:id/like': 'Like a meme',
      'DELETE /api/memes/:id': 'Delete meme (protected)',
    },
  });
});

// 404 handler - returns JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

module.exports = app;
