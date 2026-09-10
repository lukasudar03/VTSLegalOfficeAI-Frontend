import { useEffect, useRef, useState } from 'react'
import { ApiError, verifyEmail } from '../api/client'

type Status = 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')
  const requestedRef = useRef(false)

  useEffect(() => {
    // React's StrictMode runs effects twice in development; without this guard the
    // second call would reuse the (already-consumed) token and overwrite a successful
    // verification with a false "invalid or expired" error.
    if (requestedRef.current) return
    requestedRef.current = true

    const token = new URLSearchParams(window.location.search).get('token')

    if (!token) {
      setStatus('error')
      setMessage('Link za verifikaciju ne sadrži token.')
      return
    }

    verifyEmail(token)
      .then((result) => {
        setStatus('success')
        setMessage(result.message)
      })
      .catch((error) => {
        setStatus('error')
        setMessage(
          error instanceof ApiError ? error.message : 'Verifikacija nije uspela.',
        )
      })
  }, [])

  return (
    <div className="login-screen">
      <div className="login-form">
        <h1>VTS Legal Office AI</h1>

        {status === 'verifying' && <p className="login-subtitle">Verifikacija naloga u toku…</p>}

        {status === 'success' && (
          <>
            <p className="login-subtitle">{message}</p>
            <a className="verify-login-link" href="/">
              Idi na login
            </a>
          </>
        )}

        {status === 'error' && <p className="login-error">{message}</p>}
      </div>
    </div>
  )
}
