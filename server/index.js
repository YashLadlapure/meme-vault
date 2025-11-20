const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 5001; // Changed from 5000 to 5001

// Middleware
app.use(cors());
app.use(express.json());

// 1. DISABLE BROWSER CACHING (Crucial Fix)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Path Setup
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const memesFile = path.join(dataDir, 'memes.json');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Debug: Print exact file location on startup
console.log('📍 MEMES FILE PATH:', memesFile);

// Helper: Read Memes
const readMemes = () => {
  try {
    if (fs.existsSync(memesFile)) {
      const data = fs.readFileSync(memesFile, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Read Error:', error);
    return [];
  }
};

// Helper: Write Memes (With explicit error checking)
const writeMemes = (memes) => {
  try {
    fs.writeFileSync(memesFile, JSON.stringify(memes, null, 2));
    console.log(`💾 Wrote ${memes.length} memes to ${memesFile}`);
  } catch (error) {
    console.error('🔥 CRITICAL WRITE ERROR:', error);
  }
};

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Serve Images
app.use('/uploads', express.static(uploadsDir));

// ROUTES

// GET Memes
app.get('/api/memes', (req, res) => {
  const memes = readMemes();
  console.log(`📤 Sending ${memes.length} memes to frontend`);
  res.json(memes);
});

// POST Meme
app.post('/api/upload', upload.single('image'), (req, res) => { // Changed 'file' to 'image'
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { caption } = req.body;
    
    const meme = {
      _id: Date.now().toString(),
      caption: caption || 'No Caption',
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      createdAt: new Date().toISOString(),
    };

    const memes = readMemes();
    memes.unshift(meme);
    writeMemes(memes);

    res.status(201).json({ message: 'Uploaded', meme });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE Meme
app.delete('/api/memes/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting ID: ${id}`);

    const memes = readMemes();
    const initialCount = memes.length;
    
    // Filter out the meme to delete
    const newMemes = memes.filter(m => m._id.toString() !== id.toString());

    if (newMemes.length === initialCount) {
      console.log('❌ ID not found in list');
      return res.status(404).json({ error: 'Meme not found' });
    }

    // Try to delete the image file (Optional cleanup)
    const deletedMeme = memes.find(m => m._id.toString() === id.toString());
    if (deletedMeme) {
        const filePath = path.join(uploadsDir, deletedMeme.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Write the NEW array to disk
    writeMemes(newMemes);

    console.log(`✅ Success! Count went from ${initialCount} to ${newMemes.length}`);
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});