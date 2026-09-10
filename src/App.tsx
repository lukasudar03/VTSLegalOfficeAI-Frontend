import { useEffect, useState } from 'react'
import { ApiError, askQuestion, deleteDocument, getDocuments, processDocument, uploadDocument } from './api/client'
import type { ChatMessage } from './api/chat'
import type { DocumentDto } from './api/types'
import { DocumentSidebar } from './components/DocumentSidebar'
import { QaPanel } from './components/QaPanel'
import { LoginForm } from './components/LoginForm'
import { AdminPanel } from './components/AdminPanel'
import { ConfirmDialog } from './components/ConfirmDialog'
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
  const [view, setView] = useState<'documents' | 'admin'>('documents')
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<DocumentDto | null>(null)

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
    <div className="app-layout">
      <DocumentSidebar
        documents={documents}
        selectedId={selectedId}
        uploading={uploading}
        processingId={processingId}
        deletingId={deletingId}
        username={session.username}
        isAdmin={session.isAdmin}
        onSelect={(id) => {
          setView('documents')
          setSelectedId(id)
        }}
        onUpload={handleUpload}
        onProcess={handleProcess}
        onDelete={setConfirmDeleteDoc}
        onLogout={logout}
        onOpenAdmin={() => setView('admin')}
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

      {view === 'admin' && session.isAdmin ? (
        <AdminPanel
          token={session.token}
          currentUsername={session.username}
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
  )
}

export default App
