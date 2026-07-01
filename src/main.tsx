import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'
import { useAuthStore } from '@/shared/stores/auth-store'
import '@/index.css'

// Restore a persisted session (if any) before the first render.
useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
