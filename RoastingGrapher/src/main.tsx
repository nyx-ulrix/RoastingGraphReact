import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './style.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <body>
      <App />
    </body>
  </StrictMode>,
)
