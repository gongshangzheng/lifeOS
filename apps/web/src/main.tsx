import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Initial theme is resolved by the inline boot script in index.html
// (before React mounts) so the page never flashes the wrong palette.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/lifeOS">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
