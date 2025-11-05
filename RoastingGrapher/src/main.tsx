/**
 * Application Entry Point
 * 
 * Initializes React application with StrictMode and ErrorBoundary.
 * Clears caches on version updates to ensure users see the latest code.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import { initializeCacheManager } from './utils/cacheManager'
import './style.css'
import './index.css'

// Initialize cache manager before rendering
initializeCacheManager().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
})
