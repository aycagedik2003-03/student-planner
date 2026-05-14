import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
/* Importing settingsStore applies dark mode synchronously before paint */
import './store/settingsStore.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
