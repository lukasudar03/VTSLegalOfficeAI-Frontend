import { useEffect, useState } from 'react'
import {
  ApiError,
  askQuestion,
  deleteDocument,
  getChatHistory,
  getDocumentFileBlob,
  getDocuments,
  processDocument,
  uploadDocument,
} from './api/client'
import type { ChatMessage } from './api/chat'
import type { DocumentDto } from './api/types'
import { DocumentSidebar } from './components/DocumentSidebar'
import { TopBar } from './components/TopBar'
import { QaPanel } from './components/QaPanel'
import { LoginForm } from './components/LoginForm'
import { AdminPanel } from './components/AdminPanel'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DocumentPreviewModal } from './components/DocumentPreviewModal'
import { ProfilePage } from './components/ProfilePage'
import { useAuth } from './auth/AuthContext'
import './App.css'

function App() {
  const { session, logout } = useAuth()

  const [documents, setDocuments] = useState<DocumentDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [chatByDocument, setChatByDocument] = useState<Record<string, ChatMessage[]>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [view, setView] = useState<'documents' | 'admin' | 'profile'>('documents')
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<DocumentDto | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    setDocuments([])
    setSelectedId(null)
    setChatByDocument({})
    setLoadError(null)
    setView('documents')

    if (session) {
      refreshDocuments(session.token)
    }
  }, [session?.token])

  useEffect(() => {
    if (!session || !selectedId) return
    if (chatByDocument[selectedId] !== undefined) return

    const token = session.token
    const documentId = selectedId

    getChatHistory(token, documentId)
      .then((history) => {
        setChatByDocument((prev) => ({
          ...prev,
          [documentId]: history.map((m) => ({
            id: m.id,
            question: m.question,
            answer: m.answer,
            sources: m.sources,
            pending: false,
          })),
        }))
      })
      .catch((error) => {
        if (!handleAuthError(error)) {
          setLoadError(error instanceof Error ? error.message : 'Neuspešno učitavanje istorije razgovora.')
        }
      })
  }, [selectedId, session?.token])

  function handleAuthError(error: unknown): boolean {
    if (error instanceof ApiError && error.status === 401) {
      logout()
      return true
    }
    return false
  }

  async function refreshDocuments(token: string) {
    try {
      const docs = await getDocuments(token)
      setDocuments(docs)
      setLoadError(null)
    } catch (error) {
      if (!handleAuthError(error)) {
        setLoadError(error instanceof Error ? error.message : 'Neuspešno učitavanje dokumenata.')
      }
    }
  }

  async function handleUpload(file: File) {
    if (!session) return
    setUploading(true)
    try {
      const uploaded = await uploadDocument(session.token, file)
      await refreshDocuments(session.token)
      setSelectedId(uploaded.id)
    } catch (error) {
      if (!handleAuthError(error)) {
        setLoadError(error instanceof Error ? error.message : 'Otpremanje nije uspelo.')
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleProcess(id: string) {
    if (!session) return
    setProcessingId(id)
    try {
      await processDocument(session.token, id)
      await refreshDocuments(session.token)
    } catch (error) {
      if (!handleAuthError(error)) {
        setLoadError(error instanceof Error ? error.message : 'Obrada dokumenta nije uspela.')
      }
    } finally {
      setProcessingId(null)
    }
  }

  async function confirmDelete() {
    if (!session || !confirmDeleteDoc) return
    const doc = confirmDeleteDoc
    setConfirmDeleteDoc(null)

    setDeletingId(doc.id)
    try {
      await deleteDocument(session.token, doc.id)
      if (selectedId === doc.id) setSelectedId(null)
      await refreshDocuments(session.token)
    } catch (error) {
      if (!handleAuthError(error)) {
        setLoadError(error instanceof Error ? error.message : 'Brisanje dokumenta nije uspelo.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePreview(doc: DocumentDto) {
    if (!session) return
    setPreviewDoc(doc)
    setPreviewUrl(null)
    setPreviewError(null)
    setPreviewLoading(true)

    try {
      const blob = await getDocumentFileBlob(session.token, doc.id)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (error) {
      if (!handleAuthError(error)) {
        setPreviewError(error instanceof Error ? error.message : 'Pregled nije uspeo.')
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewDoc(null)
    setPreviewUrl(null)
    setPreviewError(null)
  }

  async function handleAsk(question: string) {
    if (!session || !selectedId) return
    const token = session.token
    const documentId = selectedId
    const messageId = crypto.randomUUID()

    setChatByDocument((prev) => ({
      ...prev,
      [documentId]: [...(prev[documentId] ?? []), { id: messageId, question, pending: true }],
    }))
    setAsking(true)

    try {
      const result = await askQuestion(token, documentId, question)
      setChatByDocument((prev) => ({
        ...prev,
        [documentId]: (prev[documentId] ?? []).map((m) =>
          m.id === messageId
            ? { ...m, pending: false, answer: result.answer, sources: result.sources }
            : m,
        ),
      }))
    } catch (error) {
      if (handleAuthError(error)) return

      setChatByDocument((prev) => ({
        ...prev,
        [documentId]: (prev[documentId] ?? []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                pending: false,
                error: error instanceof Error ? error.message : 'Pitanje nije uspelo.',
              }
            : m,
        ),
      }))
    } finally {
      setAsking(false)
    }
  }

  if (!session) {
    return <LoginForm />
  }

  const selectedDocument = documents.find((d) => d.id === selectedId) ?? null

  return (
    <div className="app-shell">
      <TopBar
        username={session.username}
        isAdmin={session.isAdmin}
        onOpenProfile={() => setView('profile')}
        onOpenAdmin={() => setView('admin')}
        onLogout={logout}
      />

      <div className="app-layout">
        <DocumentSidebar
          documents={documents}
          selectedId={selectedId}
          uploading={uploading}
          processingId={processingId}
          deletingId={deletingId}
          onSelect={(id) => {
            setView('documents')
            setSelectedId(id)
          }}
          onUpload={handleUpload}
          onProcess={handleProcess}
          onDelete={setConfirmDeleteDoc}
          onPreview={handlePreview}
        />

        {loadError && <div className="error-banner">{loadError}</div>}

        {confirmDeleteDoc && (
          <ConfirmDialog
            title="Obriši dokument"
            message={`Obrisati "${confirmDeleteDoc.fileName}"? Ova radnja je nepovratna.`}
            onConfirm={confirmDelete}
            onCancel={() => setConfirmDeleteDoc(null)}
          />
        )}

        {previewDoc && (
          <DocumentPreviewModal
            fileName={previewDoc.fileName}
            fileUrl={previewUrl}
            loading={previewLoading}
            error={previewError}
            onClose={closePreview}
          />
        )}

        {view === 'admin' && session.isAdmin ? (
          <AdminPanel
            token={session.token}
            currentUsername={session.username}
            onBack={() => setView('documents')}
          />
        ) : view === 'profile' ? (
          <ProfilePage
            token={session.token}
            username={session.username}
            isAdmin={session.isAdmin}
            onBack={() => setView('documents')}
          />
        ) : (
          <QaPanel
            document={selectedDocument}
            messages={selectedId ? (chatByDocument[selectedId] ?? []) : []}
            asking={asking}
            onAsk={handleAsk}
          />
        )}
      </div>
    </div>
  )
}

export default App
