import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ColorSchemeScript } from '@mantine/core'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ColorSchemeScript defaultColorScheme="light" localStorageKey="color-scheme" />
    <App />
  </StrictMode>,
)
