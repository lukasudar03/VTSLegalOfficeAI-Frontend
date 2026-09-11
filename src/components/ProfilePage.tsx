import { useState } from 'react'
import { changePassword } from '../api/client'

interface ProfilePageProps {
  token: string
  username: string
  isAdmin: boolean
  onBack: () => void
}

function initial(username: string): string {
  return username.charAt(0).toUpperCase()
}

export function ProfilePage({ token, username, isAdmin, onBack }: ProfilePageProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Nove lozinke se ne poklapaju.')
      return
    }

    setSubmitting(true)
    try {
      const result = await changePassword(token, currentPassword, newPassword)
      setSuccess(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promena lozinke nije uspela.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-panel">
      <header className="qa-panel-header">
        <button type="button" className="back-button" onClick={onBack}>
          ← Nazad na dokumente
        </button>
        <h2>Profil</h2>
      </header>

      <div className="admin-content">
        <section className="admin-section admin-create-card">
          <div className="profile-identity">
            <div className="admin-avatar profile-avatar">{initial(username)}</div>
            <span className="admin-user-name">{username}</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
        </section>

        <section className="admin-section admin-create-card">
          <h3>Promeni lozinku</h3>
          <form className="admin-create-form" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Trenutna lozinka"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <input
              type="password"
              placeholder="Nova lozinka"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Potvrdi novu lozinku"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
            >
              {submitting ? 'Čuvanje…' : 'Promeni lozinku'}
            </button>
          </form>
          {error && <p className="login-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}
        </section>
      </div>
    </main>
  )
}
