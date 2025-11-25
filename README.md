# 🎭 Meme Vault

A modern, full-stack web application for uploading, storing, and managing your favorite memes. Built with React and Node.js, Meme Vault provides a clean and intuitive interface for meme enthusiasts.

## 🚀 Live Demo

**[👉 View Live Demo](https://meme-vault-x46t.vercel.app)**

## ✨ Features

- 📷 **Upload Memes**: Easy drag-and-drop or click-to-upload interface
- 🖼️ **View Gallery**: Browse through your collection of memes
- ☁️ **Cloud Storage**: Memes stored securely on Cloudinary
- ⚡ **Fast & Responsive**: Built with Vite for lightning-fast performance
- 🎨 **Modern UI**: Clean and intuitive user interface

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage

### Deployment
- **Vercel** - Fullstack deployment platform

## 📁 Project Structure

```
meme-vault/
├── api/
│   └── index.js          # Express API (Vercel Serverless Function)
├── src/
│   ├── app.css           # Application styles
│   ├── app.jsx           # Main React component
│   └── main.jsx          # React entry point
├── .gitignore            # Git ignore rules
├── index.html            # Vite entry HTML
├── package.json          # Dependencies and scripts
├── vercel.json           # Vercel deployment config
├── vite.config.js        # Vite configuration
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudinary account (for image storage)

### Environment Variables

Create a `.env` file in the root directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/YashLadlapure/meme-vault.git
cd meme-vault
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
# Start backend
npm start

# In another terminal, start frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Deployment

This project is configured for deployment on Vercel with fullstack support:

- **Frontend**: Built with Vite, served as static files
- **Backend**: Express API runs as Vercel Serverless Functions

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Yash Ladlapure**
- GitHub: [@YashLadlapure](https://github.com/YashLadlapure)

## 🙏 Acknowledgments

- Built as a learning project to explore full-stack development
- Thanks to the React and Node.js communities
- Cloudinary for image hosting services
