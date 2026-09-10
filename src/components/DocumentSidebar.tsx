import { useRef } from 'react'
import type { DocumentDto } from '../api/types'

interface DocumentSidebarProps {
  documents: DocumentDto[]
  selectedId: string | null
  uploading: boolean
  processingId: string | null
  deletingId: string | null
  username: string
  isAdmin: boolean
  onSelect: (id: string) => void
  onUpload: (file: File) => void
  onProcess: (id: string) => void
  onDelete: (doc: DocumentDto) => void
  onLogout: () => void
  onOpenAdmin: () => void
}

const statusLabels: Record<DocumentDto['status'], string> = {
  Uploaded: 'Otpremljen',
  Processing: 'Obrađuje se…',
  Processed: 'Spreman',
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

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" />
    </svg>
  )
}

export function DocumentSidebar({
  documents,
  selectedId,
  uploading,
  processingId,
  deletingId,
  username,
  isAdmin,
  onSelect,
  onUpload,
  onProcess,
  onDelete,
  onLogout,
  onOpenAdmin,
}: DocumentSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    event.target.value = ''
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dokumenti</h2>
        <button
          type="button"
          className="upload-button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Otpremanje…' : '+ Novi PDF'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div className="user-bar">
        <span className="user-name">{username}</span>
        <button type="button" className="logout-button" onClick={onLogout}>
          Odjavi se
        </button>
      </div>

      {isAdmin && (
        <button type="button" className="admin-link" onClick={onOpenAdmin}>
          ⚙ Admin panel
        </button>
      )}

      {documents.length === 0 && (
        <p className="sidebar-empty">Još nema otpremljenih dokumenata.</p>
      )}

      <ul className="document-list">
        {documents.map((doc) => (
          <li key={doc.id}>
            <div className="document-row">
              <button
                type="button"
                className={`document-item ${doc.id === selectedId ? 'active' : ''}`}
                onClick={() => onSelect(doc.id)}
              >
                <span className="document-name" title={doc.fileName}>
                  {doc.fileName}
                </span>
                <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                  {statusLabels[doc.status]}
                </span>
                <span className="document-meta">{formatDate(doc.uploadedAt)}</span>
              </button>

              <button
                type="button"
                className="document-delete-button"
                disabled={deletingId === doc.id}
                onClick={() => onDelete(doc)}
                title="Obriši dokument"
              >
                <TrashIcon />
              </button>
            </div>

            {doc.status === 'Uploaded' && (
              <button
                type="button"
                className="process-button"
                disabled={processingId === doc.id}
                onClick={() => onProcess(doc.id)}
              >
                {processingId === doc.id ? 'Obrada u toku…' : 'Obradi dokument'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
