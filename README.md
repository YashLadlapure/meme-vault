# Meme Vault

Full-stack app for organizing memes into folders. Built this because I kept losing good memes across chats and wanted a proper place to store them.

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)]()

**Live:** [meme-vault-x46t.vercel.app](https://meme-vault-x46t.vercel.app/)

---

## What it does

Upload memes, organize them into color-coded folders, browse the gallery. Auth is JWT-based. Images go to Cloudinary. Everything else lives in MongoDB.

---

## Tech

| Layer | Stack |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| Storage | Cloudinary |
| Deployment | Vercel |

---

## Running locally

```bash
git clone https://github.com/YashLadlapure/meme-vault.git
cd meme-vault
npm install
cp .env.example .env
# fill in CLOUDINARY_*, MONGODB_URI, JWT_SECRET
npm run dev
```

---

## Structure

```
meme-vault/
├── api/          # Express API (Vercel serverless)
├── src/
│   ├── components/
│   ├── context/
│   ├── styles/
│   └── utils/
├── vercel.json
└── vite.config.js
```
