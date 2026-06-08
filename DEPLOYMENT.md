# Deployment Guide for GitHub Pages

## Quick Start

To deploy your Minecraft Wall Designer to GitHub Pages:

### 1. Using GitHub CLI (Recommended)

```bash
cd WebGL
git init
git add .
git commit -m "Initial WebGL app deployment"
git branch -M gh-pages
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin gh-pages
```

Then enable GitHub Pages in repository settings.

### 2. Manual Deployment Steps

1. Push the WebGL folder contents to a repository
2. Go to Settings → Pages
3. Set "Build and deployment" source to "Deploy from a branch"
4. Select the branch containing the WebGL files
5. Select `/root` or the appropriate folder
6. Save

### 3. Using a Subdirectory

If you want the app in a subdirectory:

```bash
# Copy WebGL contents to a folder in your repo
mkdir -p docs/wall-designer
cp -r WebGL/* docs/wall-designer/
```

Then in GitHub Pages settings, set source to `docs` folder.

## Verification

After deployment, your site will be available at:
- `https://username.github.io` (if using username.github.io repo)
- `https://username.github.io/repo-name` (if in a subdirectory)

## Local Testing

To test locally before deploying:

1. Open a terminal in the WebGL folder
2. Run a simple HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if installed)
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## Troubleshooting

- **Blank page**: Check browser console (F12) for WebGL errors
- **Assets not loading**: Verify file paths in index.html
- **GitHub Pages not updating**: Wait a few minutes, clear browser cache
