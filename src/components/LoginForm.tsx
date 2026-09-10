import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading || !username || !password}>
          {loading ? 'Prijavljivanje…' : 'Prijavi se'}
        </button>
      </form>
    </div>
  )
}
