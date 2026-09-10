import { useState } from 'react'
import { ApiError, resetPassword } from '../api/client'

type Status = 'form' | 'submitting' | 'success' | 'error'

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token')

  const [status, setStatus] = useState<Status>(token ? 'form' : 'error')
  const [message, setMessage] = useState(token ? '' : 'Link za resetovanje lozinke ne sadrži token.')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Lozinke se ne poklapaju.')
      return
    }

    setStatus('submitting')

    try {
      const result = await resetPassword(token, password)
      setStatus('success')
      setMessage(result.message)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof ApiError ? error.message : 'Resetovanje lozinke nije uspelo.')
    }
  }

  return (
    <div className="login-screen">
      {status === 'success' ? (
        <div className="login-form">
          <h1>VTS Legal Office AI</h1>
          <p className="login-subtitle">{message}</p>
          <a className="verify-login-link" href="/">
            Idi na login
          </a>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Nova lozinka</h1>
          <p className="login-subtitle">Postavi novu lozinku za svoj nalog.</p>

          <label>
            Nova lozinka
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="new-password"
              disabled={!token}
            />
          </label>

          <label>
            Potvrdi lozinku
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!token}
            />
          </label>

          {status === 'error' && <p className="login-error">{message}</p>}

          <button type="submit" disabled={!token || status === 'submitting' || !password || !confirmPassword}>
            {status === 'submitting' ? 'Čuvanje…' : 'Postavi novu lozinku'}
          </button>
        </form>
      )}
    </div>
  )
}
