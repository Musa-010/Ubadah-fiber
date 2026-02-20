# Ubadah-fiber

Ubadah Internet — Connect Smarter, Live Faster.

## 🌐 Live Website

**[https://musa-010.github.io/Ubadah-fiber/](https://musa-010.github.io/Ubadah-fiber/)**

- **Main site:** `https://musa-010.github.io/Ubadah-fiber/`
- **Admin portal:** `https://musa-010.github.io/Ubadah-fiber/#/admin/login`

## 🚀 GitHub Pages Setup

This project deploys automatically to GitHub Pages via GitHub Actions on every push to `main`.

**To enable GitHub Pages:**
1. Go to your repository **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow (`.github/workflows/deploy.yml`) will build and deploy the site automatically

> **Note:** If you prefer to deploy from the `docs/` folder, set the source to **Deploy from a branch**, choose `main` branch and `/docs` folder.

## 🛠️ Local Development

```bash
npm install
npm start
```

## 📦 Build & Deploy

```bash
npm run build   # builds into the build/ folder
```

The GitHub Actions workflow handles deployment automatically on push to `main`.
