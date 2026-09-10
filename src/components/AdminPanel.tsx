import { useEffect, useState } from 'react'
import { createUser, getUsers } from '../api/client'
import type { UserDto } from '../api/types'

interface AdminPanelProps {
  token: string
  onBack: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminPanel({ token, onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<UserDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    refreshUsers()
  }, [])

  async function refreshUsers() {
    setLoadingUsers(true)
    try {
      setUsers(await getUsers(token))
      setListError(null)
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Neuspešno učitavanje korisnika.')
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setCreateError(null)
    setCreating(true)

    try {
      await createUser(token, username, email, password)
      setUsername('')
      setEmail('')
      setPassword('')
      await refreshUsers()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Kreiranje korisnika nije uspelo.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="admin-panel">
      <header className="qa-panel-header">
        <button type="button" className="back-button" onClick={onBack}>
          ← Nazad na dokumente
        </button>
        <h2>Admin panel</h2>
      </header>

      <div className="admin-content">
        <section className="admin-section">
          <h3>Novi korisnik</h3>
          <p className="admin-hint">Korisnik će dobiti email sa linkom za aktivaciju naloga.</p>
          <form className="admin-create-form" onSubmit={handleSubmit}>
            <input
              placeholder="Korisničko ime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="submit" disabled={creating || !username || !email || !password}>
              {creating ? 'Kreiranje…' : 'Kreiraj korisnika'}
            </button>
          </form>
          {createError && <p className="login-error">{createError}</p>}
        </section>

        <section className="admin-section">
          <h3>Korisnici</h3>
          {listError && <p className="login-error">{listError}</p>}
          {loadingUsers ? (
            <p className="chat-empty">Učitavanje…</p>
          ) : (
            <ul className="admin-user-list">
              {users.map((user) => (
                <li key={user.id}>
                  <div className="admin-user-info">
                    <span className="admin-user-name">{user.username}</span>
                    <span className="admin-user-email">{user.email}</span>
                  </div>
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                  {!user.emailVerified && <span className="admin-badge pending">Neverifikovan</span>}
                  <span className="document-meta">{formatDate(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
