# Meme Vault

A modern, full-stack web application for uploading, storing, and managing meme collections. Built with React, Node.js, and MongoDB, Meme Vault provides a clean, intuitive interface for organizing and browsing memes with secure user authentication.

## Live Demo

[View Live Demo](https://meme-vault-x46t.vercel.app/)

## Features

- **User Authentication**: Secure JWT-based login and registration system
- **Folder Organization**: Create and manage custom meme folders with color coding
- **Meme Upload**: Drag-and-drop or click-to-upload interface with image validation
- **Cloud Storage**: Memes stored securely on Cloudinary with optimized delivery
- **Gallery View**: Browse and organize memes within custom collections
- **Responsive Design**: Full responsiveness across desktop, tablet, and mobile devices
- **Fast Performance**: Built with Vite for lightning-fast development and production builds
- **Clean Interface**: Professional UI with intuitive navigation

## Technical Stack

### Frontend

- **React** - UI library for building interactive interfaces
- **Vite** - Modern build tool and dev server
- **CSS3** - Styling and responsive design
- **Axios** - HTTP client for API communication

### Backend

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Multer** - Middleware for handling file uploads
- **Cloudinary** - Cloud image storage and optimization
- **JWT** - JSON Web Token for secure authentication
- **Bcrypt** - Password hashing and security

### Deployment

- **Vercel** - Frontend and serverless backend deployment platform

## Project Structure

```
meme-vault/
clj├─ api/
│  └─ index.js                  # Express API (Vercel serverless function)
├─ src/
│  ├─ components/
│  │  ├─ Dashboard.jsx          # Main dashboard component
│  │  ├─ FolderView.jsx         # Folder and meme display
│  │  ├─ Upload.jsx            # Meme upload component
│  │  ├─ Login.jsx             # User login form
│  │  ├─ Register.jsx          # User registration form
│  │  └─ Navbar.jsx            # Navigation bar
│  ├─ context/                 # React context for state management
│  ├─ styles/                  # CSS styling
│  ├─ utils/                   # Utility functions
│  ├─ app.jsx                  # Main app component
│  ├─ main.jsx                 # React entry point
│  └─ app.css                  # Global styles
├─ package.json                # Project dependencies and scripts
├─ vite.config.js              # Vite build configuration
├─ vercel.json                 # Vercel deployment config
└─ README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Cloudinary account (for image storage)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YashLadlapure/meme-vault.git
cd meme-vault
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meme-vault

# JWT Configuration
JWT_SECRET=your_secret_key_change_in_production
```

4. Start the development server:
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Folders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/folders` | Create new folder |
| GET | `/api/folders` | Get all user folders |
| DELETE | `/api/folders/:id` | Delete folder |

### Memes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders/:folderId/memes` | Get memes in folder |
| POST | `/api/memes` | Upload meme to folder |
| DELETE | `/api/memes/:id` | Delete meme |

## Database Schema

### User Schema
```javascript
{
  username: String (required, unique, min 3 chars),
  email: String (required, unique, valid format),
  password: String (hashed, required, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Folder Schema
```javascript
{
  name: String (required),
  userId: ObjectId (reference to User),
  description: String,
  color: String (hex color, default: #3B82F6),
  createdAt: Date,
  updatedAt: Date
}
```

### Meme Schema
```javascript
{
  title: String (required),
  folderId: ObjectId (reference to Folder),
  imageUrl: String (Cloudinary URL),
  publicId: String (Cloudinary public ID),
  userId: ObjectId (reference to User),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel automatically deploys on push to main branch

**Frontend**: Deployed as static site
**Backend**: Deployed as serverless functions in `api/` directory

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start backend API
npm start

# Start backend in dev mode with auto-reload
npm run dev
```

## Security Considerations

- Passwords are hashed using bcrypt (salt rounds: 10)
- JWT tokens expire after 24 hours
- CORS is enabled for secure cross-origin requests
- Folder and meme operations require user authentication
- All file uploads are validated on both client and server
- Environment variables are used for sensitive configuration

## Performance Optimization

- Cloudinary handles image optimization and CDN delivery
- Vite provides fast build times and optimized code splitting
- MongoDB connection pooling for efficient database queries
- Cache control headers prevent unnecessary data reloading

## Future Enhancements

- Social sharing capabilities
- Meme search and filtering
- User profile customization
- Collaborative folders
- Advanced image editing tools
- Analytics and usage statistics

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, open an issue on GitHub or contact the project maintainer.

---

**Author**: Yash Ladlapure
**Repository**: [github.com/YashLadlapure/meme-vault](https://github.com/YashLadlapure/meme-vault)
