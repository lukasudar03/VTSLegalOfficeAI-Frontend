import { useState } from 'react'
import { changePassword } from '../api/client'
import { PasswordInput } from './PasswordInput'

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
            <PasswordInput
              placeholder="Trenutna lozinka"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordInput
              placeholder="Nova lozinka (najmanje 8 karaktera)"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              minLength={8}
              required
              showStrength
            />
            <PasswordInput
              placeholder="Potvrdi novu lozinku"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              minLength={8}
              required
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
