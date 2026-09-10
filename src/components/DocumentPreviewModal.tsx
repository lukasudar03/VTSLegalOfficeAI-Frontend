interface DocumentPreviewModalProps {
  fileName: string
  fileUrl: string | null
  loading: boolean
  error: string | null
  onClose: () => void
}

export function DocumentPreviewModal({ fileName, fileUrl, loading, error, onClose }: DocumentPreviewModalProps) {
  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-card" onClick={(e) => e.stopPropagation()}>
        <header className="preview-header">
          <span className="preview-title" title={fileName}>
            {fileName}
          </span>
          <button type="button" className="preview-close" onClick={onClose} title="Zatvori">
            ✕
          </button>
        </header>

        <div className="preview-body">
          {loading && <p className="chat-empty">Učitavanje pregleda…</p>}
          {error && <p className="login-error">{error}</p>}
          {fileUrl && !loading && !error && (
            <iframe src={fileUrl} title={fileName} className="preview-frame" />
          )}
        </div>
      </div>
    </div>
  )
}
