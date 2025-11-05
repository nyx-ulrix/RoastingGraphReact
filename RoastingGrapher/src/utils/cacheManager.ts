/**
 * Cache Manager
 * 
 * Handles cache clearing and version management to ensure users always see
 * the latest version of the application.
 */

const APP_VERSION = '1.5.1';
const VERSION_KEY = 'app_version';

/**
 * Clears all application caches
 */
async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[Cache Manager] All caches cleared');
    } catch (error) {
      console.error('[Cache Manager] Error clearing caches:', error);
    }
  }
}

/**
 * Unregisters all service workers
 */
async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('[Cache Manager] Service workers unregistered');
    } catch (error) {
      console.error('[Cache Manager] Error unregistering service workers:', error);
    }
  }
}

/**
 * Clears old localStorage data but preserves current session data
 */
function clearOldLocalStorage(): void {
  try {
    const currentSessionKeys: string[] = [];
    
    // Find all current roasting session keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('roasting_session_')) {
        currentSessionKeys.push(key);
      }
    }

    // Store session data temporarily
    const sessionData: Record<string, string> = {};
    currentSessionKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) sessionData[key] = value;
    });

    // Clear all localStorage
    localStorage.clear();

    // Restore session data
    Object.entries(sessionData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('[Cache Manager] Old localStorage cleared, sessions preserved');
  } catch (error) {
    console.error('[Cache Manager] Error clearing localStorage:', error);
  }
}

/**
 * Checks app version and clears caches if version has changed
 */
export async function initializeCacheManager(): Promise<void> {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion !== APP_VERSION) {
      console.log(`[Cache Manager] Version change detected: ${storedVersion || 'none'} → ${APP_VERSION}`);
      console.log('[Cache Manager] Clearing caches...');

      // Clear all caches
      await clearAllCaches();
      await unregisterServiceWorkers();
      clearOldLocalStorage();

      // Update version
      localStorage.setItem(VERSION_KEY, APP_VERSION);

      console.log('[Cache Manager] Cache clearing complete');
    } else {
      console.log(`[Cache Manager] Version ${APP_VERSION} - caches are up to date`);
    }
  } catch (error) {
    console.error('[Cache Manager] Initialization error:', error);
  }
}

/**
 * Forces a cache clear and page reload
 */
export async function forceClearCacheAndReload(): Promise<void> {
  console.log('[Cache Manager] Force clearing caches...');
  await clearAllCaches();
  await unregisterServiceWorkers();
  localStorage.clear();
  window.location.reload();
}

