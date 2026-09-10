import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { VerifyEmailPage } from './components/VerifyEmailPage.tsx'

const isVerifyEmailRoute = window.location.pathname === '/verify-email'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isVerifyEmailRoute ? (
      <VerifyEmailPage />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)
