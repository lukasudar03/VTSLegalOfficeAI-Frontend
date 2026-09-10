import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { VerifyEmailPage } from './components/VerifyEmailPage.tsx'
import { ResetPasswordPage } from './components/ResetPasswordPage.tsx'

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/verify-email' ? (
      <VerifyEmailPage />
    ) : path === '/reset-password' ? (
      <ResetPasswordPage />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)
