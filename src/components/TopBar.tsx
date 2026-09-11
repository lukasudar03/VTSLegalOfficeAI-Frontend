interface TopBarProps {
  username: string
  isAdmin: boolean
  onOpenProfile: () => void
  onOpenAdmin: () => void
  onLogout: () => void
}

export function TopBar({ username, isAdmin, onOpenProfile, onOpenAdmin, onLogout }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-brand">VTS Legal Office AI</div>

      <div className="top-bar-actions">
        <span className="user-name">{username}</span>

        {isAdmin && (
          <button type="button" className="top-bar-link" onClick={onOpenAdmin}>
            ⚙ Admin panel
          </button>
        )}

        <button type="button" className="top-bar-link" onClick={onOpenProfile}>
          👤 Profil
        </button>

        <button type="button" className="logout-button" onClick={onLogout}>
          Odjavi se
        </button>
      </div>
    </header>
  )
}
