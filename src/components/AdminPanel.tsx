import { useEffect, useState } from 'react'
import { createUser, deleteUser, getUsers, updateUser } from '../api/client'
import type { UserDto } from '../api/types'

interface AdminPanelProps {
  token: string
  currentUsername: string
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

function initial(username: string): string {
  return username.charAt(0).toUpperCase()
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18" strokeLinecap="round" />
      <path d="M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

export function AdminPanel({ token, currentUsername, onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<UserDto[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function startEdit(user: UserDto) {
    setEditingId(user.id)
    setEditUsername(user.username)
    setEditEmail(user.email)
    setRowError((prev) => ({ ...prev, [user.id]: '' }))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: string) {
    setSavingEdit(true)
    try {
      await updateUser(token, id, editUsername, editEmail)
      setEditingId(null)
      await refreshUsers()
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [id]: error instanceof Error ? error.message : 'Izmena nije uspela.',
      }))
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(user: UserDto) {
    const confirmed = window.confirm(
      `Obrisati korisnika "${user.username}"? Ovo briše i sve njegove dokumente. Ova radnja je nepovratna.`,
    )
    if (!confirmed) return

    setDeletingId(user.id)
    try {
      await deleteUser(token, user.id)
      await refreshUsers()
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [user.id]: error instanceof Error ? error.message : 'Brisanje nije uspelo.',
      }))
    } finally {
      setDeletingId(null)
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
        <section className="admin-section admin-create-card">
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
          <div className="admin-section-title">
            <h3>Korisnici</h3>
            {!loadingUsers && <span className="admin-count">{users.length}</span>}
          </div>
          {listError && <p className="login-error">{listError}</p>}

          {loadingUsers ? (
            <p className="chat-empty">Učitavanje…</p>
          ) : (
            <ul className="admin-user-list">
              {users.map((user) => {
                const isEditing = editingId === user.id
                const isSelf = user.username === currentUsername

                return (
                  <li key={user.id} className={isEditing ? 'editing' : ''}>
                    <div className="admin-avatar">{initial(user.username)}</div>

                    {isEditing ? (
                      <div className="admin-edit-fields">
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          placeholder="Korisničko ime"
                        />
                        <input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                        />
                      </div>
                    ) : (
                      <div className="admin-user-info">
                        <span className="admin-user-name">
                          {user.username}
                          {isSelf && <span className="admin-you">(ti)</span>}
                        </span>
                        <span className="admin-user-email">{user.email}</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="admin-user-badges">
                        {user.isAdmin && <span className="admin-badge">Admin</span>}
                        {!user.emailVerified && <span className="admin-badge pending">Neverifikovan</span>}
                        <span className="document-meta">{formatDate(user.createdAt)}</span>
                      </div>
                    )}

                    <div className="admin-row-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="icon-button confirm"
                            onClick={() => saveEdit(user.id)}
                            disabled={savingEdit || !editUsername || !editEmail}
                            title="Sačuvaj"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                            title="Otkaži"
                          >
                            <XIcon />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => startEdit(user)}
                            title="Izmeni"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            onClick={() => handleDelete(user)}
                            disabled={isSelf || deletingId === user.id}
                            title={isSelf ? 'Ne možeš obrisati sopstveni nalog' : 'Obriši'}
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>

                    {rowError[user.id] && <p className="admin-row-error">{rowError[user.id]}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
