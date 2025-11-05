/**
 * Application Entry Point
 * 
 * Initializes the React application and renders the root App component.
 * Wraps the app in StrictMode for additional development checks.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './style.css'
import './index.css'

// Render the app to the root element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
