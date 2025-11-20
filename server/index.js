const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create data directory for storing meme metadata
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const memesFile = path.join(dataDir, 'memes.json');

// Helper function to read memes from JSON file
const readMemes = () => {
  try {
    if (fs.existsSync(memesFile)) {
      const data = fs.readFileSync(memesFile, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading memes:', error);
    return [];
  }
};

// Helper function to write memes to JSON file
const writeMemes = (memes) => {
  try {
    fs.writeFileSync(memesFile, JSON.stringify(memes, null, 2));
  } catch (error) {
    console.error('Error writing memes:', error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Serve uploaded files as static files
app.use('/uploads', express.static(uploadsDir));

// Routes

// GET /api/memes - Get all memes
app.get('/api/memes', (req, res) => {
  try {
    const memes = readMemes();
    res.json(memes);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// POST /api/upload - Upload a meme
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caption } = req.body;

    if (!caption || caption.trim() === '') {
      // Delete the uploaded file if no caption provided
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Caption is required' });
    }

    // Create meme object
    const meme = {
      _id: Date.now().toString(),
      caption: caption.trim(),
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      createdAt: new Date().toISOString(),
    };

    // Read existing memes, add new one, and save
    const memes = readMemes();
    memes.unshift(meme); // Add to beginning (newest first)
    writeMemes(memes);

    res.status(201).json({ message: 'Meme uploaded successfully', meme });
  } catch (error) {
    console.error('Error uploading meme:', error);
    res.status(500).json({ error: 'Failed to upload meme' });
  }
});

// DELETE /api/memes/:id - Delete a meme
app.delete('/api/memes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const memes = readMemes();

    const memeIndex = memes.findIndex((m) => m._id === id);
    if (memeIndex === -1) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    const meme = memes[memeIndex];

    // Delete the file from disk
    const filePath = path.join(uploadsDir, meme.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array and save
    memes.splice(memeIndex, 1);
    writeMemes(memes);

    res.json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error: ' + err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Meme Vault Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`💾 Data directory: ${dataDir}`);
});
