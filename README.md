# 🎭 Meme Vault

A modern, full-stack web application for uploading, storing, and managing your favorite memes. Built with React and Node.js, Meme Vault provides a clean and intuitive interface for meme enthusiasts.

## ✨ Features

- 📤 **Upload Memes**: Easy drag-and-drop or click-to-upload interface
- 🖼️ **View Gallery**: Browse through your collection of memes
- 💾 **Local Storage**: All memes stored locally on the server
- ⚡ **Fast & Responsive**: Built with Vite for lightning-fast performance
- 🎨 **Modern UI**: Clean and intuitive user interface

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YashLadlapure/meme-vault.git
   cd meme-vault
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## 🎯 Usage

### Running the Backend Server

```bash
cd server
npm start
```

The server will start on `http://localhost:5000` (or your configured port)

### Running the Frontend

```bash
cd client
npm run dev
```

The application will open at `http://localhost:5173`

## 📁 Project Structure

```
meme-vault/
├── client/                # Frontend React application
│   ├── src/              # Source files
│   ├── index.html        # Entry HTML file
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── server/               # Backend Node.js application
│   ├── data/            # Uploaded memes storage
│   ├── index.js         # Server entry point
│   └── package.json     # Backend dependencies
└── .gitignore           # Git ignore file
```

## 🔧 Configuration

### Server Configuration
Edit `server/index.js` to configure:
- Port number
- File upload settings
- CORS settings

### Client Configuration
Edit `client/vite.config.js` to configure:
- Development server port
- Build settings
- Proxy settings

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
- Portfolio: [yashladlapure.github.io/portfolio-website](https://yashladlapure.github.io/portfolio-website)

## 🙏 Acknowledgments

- Built as a learning project to explore full-stack development
- Thanks to the React and Node.js communities

---

⭐ Star this repository if you found it helpful!
