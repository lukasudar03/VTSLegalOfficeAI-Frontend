import { useRef, useState } from 'react'
import type { DocumentDto, DocumentType } from '../api/types'

export const ALL_DOCUMENTS_ID = '__all__'

interface DocumentSidebarProps {
  documents: DocumentDto[]
  selectedId: string | null
  uploading: boolean
  processingId: string | null
  deletingId: string | null
  onSelect: (id: string) => void
  onUpload: (file: File, documentType: DocumentType) => void
  onProcess: (id: string) => void
  onDelete: (doc: DocumentDto) => void
  onPreview: (doc: DocumentDto) => void
}

const statusLabels: Record<DocumentDto['status'], string> = {
  Uploaded: 'Otpremljen',
  Processing: 'Obrađuje se…',
  Processed: 'Spreman',
}

const typeLabels: Record<DocumentType, string> = {
  Zakon: 'Zakon',
  Pravilnik: 'Pravilnik',
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

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function DocumentSidebar({
  documents,
  selectedId,
  uploading,
  processingId,
  deletingId,
  onSelect,
  onUpload,
  onProcess,
  onDelete,
  onPreview,
}: DocumentSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingType, setPendingType] = useState<DocumentType>('Pravilnik')

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file, pendingType)
    }
    event.target.value = ''
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dokumenti</h2>
      </div>

      <div className="sidebar-upload-row">
        <select
          className="document-type-select"
          value={pendingType}
          onChange={(e) => setPendingType(e.target.value as DocumentType)}
          title="Tip akta za sledeći otpremljeni dokument"
        >
          <option value="Pravilnik">Pravilnik</option>
          <option value="Zakon">Zakon</option>
        </select>
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

      {documents.length > 0 && (
        <button
          type="button"
          className={`all-documents-item ${selectedId === ALL_DOCUMENTS_ID ? 'active' : ''}`}
          onClick={() => onSelect(ALL_DOCUMENTS_ID)}
        >
          Svi dokumenti
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
                <span className="document-badges">
                  <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                    {statusLabels[doc.status]}
                  </span>
                  <span className={`type-badge type-${doc.documentType.toLowerCase()}`}>
                    {typeLabels[doc.documentType]}
                  </span>
                </span>
                <span className="document-meta">{formatDate(doc.uploadedAt)}</span>
              </button>

              <button
                type="button"
                className="document-icon-button"
                onClick={() => onPreview(doc)}
                title="Pregledaj PDF"
              >
                <EyeIcon />
              </button>

              <button
                type="button"
                className="document-icon-button danger"
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
