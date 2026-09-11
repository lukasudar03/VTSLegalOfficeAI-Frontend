import { useState } from 'react'
import { forgotPassword } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PasswordInput } from './PasswordInput'

export function LoginForm() {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prijava nije uspela.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotSubmit(event: React.FormEvent) {
    event.preventDefault()
    setForgotSubmitting(true)
    setForgotMessage(null)

    try {
      const result = await forgotPassword(forgotEmail)
      setForgotMessage(result.message)
    } catch (err) {
      setForgotMessage(err instanceof Error ? err.message : 'Zahtev nije uspeo.')
    } finally {
      setForgotSubmitting(false)
    }
  }

  function backToLogin() {
    setMode('login')
    setForgotEmail('')
    setForgotMessage(null)
  }

  if (mode === 'forgot') {
    return (
      <div className="login-screen">
        <form className="login-form" onSubmit={handleForgotSubmit}>
          <h1>Zaboravljena lozinka</h1>
          <p className="login-subtitle">Unesi email povezan sa nalogom — poslaćemo link za resetovanje.</p>

          <label>
            Email
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoFocus
              autoComplete="email"
            />
          </label>

          {forgotMessage && <p className="login-subtitle">{forgotMessage}</p>}

          <button type="submit" disabled={forgotSubmitting || !forgotEmail}>
            {forgotSubmitting ? 'Slanje…' : 'Pošalji link'}
          </button>

          <button type="button" className="verify-login-link" onClick={backToLogin}>
            ← Nazad na prijavu
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>VTS Legal Office AI</h1>
        <p className="login-subtitle">Prijavi se da bi nastavio.</p>

        <label>
          Korisničko ime
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </label>

        <label>
          Lozinka
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading || !username || !password}>
          {loading ? 'Prijavljivanje…' : 'Prijavi se'}
        </button>

        <button type="button" className="verify-login-link" onClick={() => setMode('forgot')}>
          Zaboravljena lozinka?
        </button>
      </form>
    </div>
  )
}
