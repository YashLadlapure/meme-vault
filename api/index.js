const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();

// ============ CLOUDINARY CONFIG ============
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'meme-vault',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage });

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ============ DATABASE CONNECTION ============
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const mongoUri = process.env.MONGODB_URI;
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// ============ SCHEMAS & MODELS ============
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/.+@.+/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ============ FOLDER SCHEMA ============
const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      minlength: [1, 'Folder name cannot be empty'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
  },
  { timestamps: true }
);

const Folder = mongoose.models.Folder || mongoose.model('Folder', folderSchema);

// ============ MEME SCHEMA ============
const memeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Meme = mongoose.models.Meme || mongoose.model('Meme', memeSchema);

// ============ AUTH MIDDLEWARE ============
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production'
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, username, email: newUser.email },
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_key_here_change_this_in_production',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

// ============ FOLDER ROUTES ============
app.post('/api/folders', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const newFolder = new Folder({
      name,
      description: description || '',
      color: color || '#3B82F6',
      userId: req.user.userId,
    });

    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('❌ Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder', details: error.message });
  }
});

app.get('/api/folders', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const folders = await Folder.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ folders });
  } catch (error) {
    console.error('❌ Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders', details: error.message });
  }
});

app.delete('/api/folders/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this folder' });
    }

    // Delete all memes in folder
    await Meme.deleteMany({ folderId: id });
    await Folder.findByIdAndDelete(id);

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('❌ Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder', details: error.message });
  }
});

// ============ MEME ROUTES ============
app.get('/api/folders/:folderId/memes', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to access this folder' });
    }

    const memes = await Meme.find({ folderId }).sort({ createdAt: -1 });
    res.json({ memes, folder });
  } catch (error) {
    console.error('❌ Get memes error:', error);
    res.status(500).json({ error: 'Failed to fetch memes', details: error.message });
  }
});

app.post('/api/memes', authMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    try {
      if (err) {
        console.error('❌ Upload error:', err);
        return res.status(500).json({ error: 'Failed to upload image', details: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      await connectDB();

      const { title, folderId, description } = req.body;

      if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
      }

      // Verify folder ownership
      const folder = await Folder.findById(folderId);
      if (!folder || folder.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized to add memes to this folder' });
      }

      const newMeme = new Meme({
        title: title || 'Untitled Meme',
        folderId,
        imageUrl: req.file.path,
        publicId: req.file.filename,
        userId: req.user.userId,
        description: description || '',
      });

      await newMeme.save();
      res.status(201).json(newMeme);
    } catch (error) {
      console.error('❌ Save meme error:', error);
      res.status(500).json({ error: 'Failed to save meme', details: error.message });
    }
  });
});

app.delete('/api/memes/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    if (meme.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this meme' });
    }

    if (meme.publicId) {
      await cloudinary.uploader.destroy(meme.publicId);
    }

    await Meme.findByIdAndDelete(id);
    res.json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('❌ Delete meme error:', error);
    res.status(500).json({ error: 'Failed to delete meme', details: error.message });
  }
});

app.get('/api', async (req, res) => {
  try {
    await connectDB();
    res.json({
      message: '✅ Meme Vault API is running!',
      endpoints: {
        'POST /api/auth/register': 'Register user',
        'POST /api/auth/login': 'Login user',
        'POST /api/folders': 'Create folder',
        'GET /api/folders': 'Get user folders',
        'DELETE /api/folders/:id': 'Delete folder',
        'GET /api/folders/:folderId/memes': 'Get memes in folder',
        'POST /api/memes': 'Upload meme to folder',
        'DELETE /api/memes/:id': 'Delete meme',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
          }
  })

module.exports = app;

  module.exports = app;
