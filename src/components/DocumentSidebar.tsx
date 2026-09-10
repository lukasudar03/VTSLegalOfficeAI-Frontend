import { useRef } from 'react'
import type { DocumentDto } from '../api/types'

interface DocumentSidebarProps {
  documents: DocumentDto[]
  selectedId: string | null
  uploading: boolean
  processingId: string | null
  onSelect: (id: string) => void
  onUpload: (file: File) => void
  onProcess: (id: string) => void
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

export function DocumentSidebar({
  documents,
  selectedId,
  uploading,
  processingId,
  onSelect,
  onUpload,
  onProcess,
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

      {documents.length === 0 && (
        <p className="sidebar-empty">Još nema otpremljenih dokumenata.</p>
      )}

      <ul className="document-list">
        {documents.map((doc) => (
          <li key={doc.id}>
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
