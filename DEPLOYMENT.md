# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages automatically.

## Automatic Deployment (Recommended)

The project is set up with GitHub Actions to automatically deploy whenever you push to the `main` branch.

### Setup Steps:

1. **Enable GitHub Pages in your repository settings:**
   - Go to your GitHub repository
   - Click on "Settings"
   - Navigate to "Pages" in the left sidebar
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"

2. **Push your changes:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to the "Actions" tab in your repository
   - Watch the deployment workflow run
   - Once complete, your site will be live at: `https://[your-username].github.io/RoastingGraphReact/`

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. **Install gh-pages package:**
   ```bash
   cd RoastingGrapher
   npm install --save-dev gh-pages
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

## Configuration Details

- **Base URL:** `/RoastingGraphReact/` (configured in `vite.config.ts`)
- **Build Output:** `RoastingGrapher/dist/`
- **Deployment Branch:** `gh-pages` (for manual deployment)

## Troubleshooting

### Issue: "The site configured at this address does not contain the requested file"
- **Solution:** Make sure GitHub Pages is enabled and set to use "GitHub Actions" as the source

### Issue: Assets not loading (404 errors)
- **Solution:** Verify the `base` path in `vite.config.ts` matches your repository name

### Issue: Blank page after deployment
- **Solution:** Check the browser console for errors and verify the base path is correct

## Local Preview

To preview the production build locally:

```bash
cd RoastingGrapher
npm run build
npm run preview
```

This will start a local server to preview the built application.

