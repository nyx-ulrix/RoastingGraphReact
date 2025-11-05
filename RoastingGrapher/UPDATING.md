# Updating the Application

## How to Release New Versions

When you make changes to the application that you want users to see immediately, follow these steps:

### 1. Update the Version Number

Update the version in **two places**:

**File 1: `package.json`**
```json
{
  "version": "1.0.0"  ← Change this (e.g., to "1.0.1")
}
```

**File 2: `src/utils/cacheManager.ts`**
```typescript
const APP_VERSION = '1.0.0';  ← Change this (e.g., to "1.0.1")
```

**Important:** Both version numbers must match!

### 2. Version Numbering Convention

Use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** (1.x.x): Breaking changes, complete redesign
- **MINOR** (x.1.x): New features, significant updates
- **PATCH** (x.x.1): Bug fixes, small tweaks

Examples:
- Bug fix: `1.0.0` → `1.0.1`
- New feature: `1.0.1` → `1.1.0`
- Major rewrite: `1.1.0` → `2.0.0`

### 3. What Happens Automatically

When users reload the page with a new version:

✅ All browser caches are cleared
✅ Service workers are unregistered
✅ Old localStorage data is removed
✅ **Current roasting sessions are preserved**
✅ Fresh assets are downloaded
✅ Console logs version change

### 4. Testing the Update

1. Change the version numbers
2. Run `npm run dev` or `npm run build`
3. Open browser DevTools (F12)
4. Check the Console tab
5. You should see: `[Cache Manager] Version change detected: X.X.X → Y.Y.Y`

### 5. Deploying Updates

After updating versions:

```bash
# Build the application
npm run build

# The dist/ folder contains versioned files ready for deployment
```

## Manual Cache Clear

Users can also manually clear caches by:
1. Opening browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or in the code, call:
```typescript
import { forceClearCacheAndReload } from './utils/cacheManager'
forceClearCacheAndReload()
```

## Cache Strategy

The cache manager:
- Runs before the React app renders
- Compares stored version with current version
- Only clears caches when version changes
- Preserves active roasting session data
- Logs all actions to console for debugging


