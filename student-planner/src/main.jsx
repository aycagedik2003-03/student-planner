import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useSettingsStore from './store/settingsStore.js'

const Root = () => {
  const initDarkMode = useSettingsStore(s => s.initDarkMode)
  useEffect(() => { initDarkMode() }, [initDarkMode])
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
