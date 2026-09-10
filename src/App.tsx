import { useEffect, useState } from 'react'
import { askQuestion, getDocuments, processDocument, uploadDocument } from './api/client'
import type { ChatMessage } from './api/chat'
import type { DocumentDto } from './api/types'
import { DocumentSidebar } from './components/DocumentSidebar'
import { QaPanel } from './components/QaPanel'
import './App.css'

function App() {
  const [documents, setDocuments] = useState<DocumentDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [chatByDocument, setChatByDocument] = useState<Record<string, ChatMessage[]>>({})
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    refreshDocuments()
  }, [])

  async function refreshDocuments() {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Neuspešno učitavanje dokumenata.')
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const uploaded = await uploadDocument(file)
      await refreshDocuments()
      setSelectedId(uploaded.id)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Otpremanje nije uspelo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleProcess(id: string) {
    setProcessingId(id)
    try {
      await processDocument(id)
      await refreshDocuments()
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Obrada dokumenta nije uspela.')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleAsk(question: string) {
    if (!selectedId) return
    const documentId = selectedId
    const messageId = crypto.randomUUID()

    setChatByDocument((prev) => ({
      ...prev,
      [documentId]: [...(prev[documentId] ?? []), { id: messageId, question, pending: true }],
    }))
    setAsking(true)

    try {
      const result = await askQuestion(documentId, question)
      setChatByDocument((prev) => ({
        ...prev,
        [documentId]: (prev[documentId] ?? []).map((m) =>
          m.id === messageId
            ? { ...m, pending: false, answer: result.answer, sources: result.sources }
            : m,
        ),
      }))
    } catch (error) {
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

  const selectedDocument = documents.find((d) => d.id === selectedId) ?? null

  return (
    <div className="app-layout">
      <DocumentSidebar
        documents={documents}
        selectedId={selectedId}
        uploading={uploading}
        processingId={processingId}
        onSelect={setSelectedId}
        onUpload={handleUpload}
        onProcess={handleProcess}
      />

      {loadError && <div className="error-banner">{loadError}</div>}

      <QaPanel
        document={selectedDocument}
        messages={selectedId ? (chatByDocument[selectedId] ?? []) : []}
        asking={asking}
        onAsk={handleAsk}
      />
    </div>
  )
}

export default App
