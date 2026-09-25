import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage } from '../api/chat'
import type { DocumentDto } from '../api/types'
import { EmptyState } from './EmptyState'

interface QaPanelProps {
  document: DocumentDto | null
  multiMode?: boolean
  messages: ChatMessage[]
  asking: boolean
  onAsk: (question: string) => void
}

export function QaPanel({ document, multiMode = false, messages, asking, onAsk }: QaPanelProps) {
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [question])

  if (!multiMode && !document) {
    return (
      <main className="qa-panel">
        <EmptyState />
      </main>
    )
  }

  if (!multiMode && document && document.status !== 'Processed') {
    return (
      <main className="qa-panel qa-panel-empty">
        <h2>{document.fileName}</h2>
        <p>
          {document.status === 'Processing'
            ? 'Dokument se trenutno obrađuje (ekstrakcija teksta, chunking i embeddings)…'
            : 'Dokument još nije obrađen. Klikni "Obradi dokument" u listi sa leve strane.'}
        </p>
      </main>
    )
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || asking) return
    onAsk(trimmed)
    setQuestion('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <main className="qa-panel">
      <header className="qa-panel-header">
        <h2>{multiMode ? 'Svi dokumenti' : document?.fileName}</h2>
        {!multiMode && document && <span className="qa-panel-meta">{document.totalPages} strana</span>}
      </header>

      <div className="chat-log">
        {messages.length === 0 && (
          <p className="chat-empty">
            {multiMode
              ? 'Postavi pitanje koje pretražuje sve tvoje obrađene dokumente.'
              : 'Postavi pitanje o sadržaju ovog dokumenta.'}
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="chat-entry">
            <div className="chat-question">{message.question}</div>

            {message.pending && <div className="chat-answer pending">Razmišljam…</div>}

            {message.error && <div className="chat-answer error">{message.error}</div>}

            {message.answer && (
              <div className="chat-answer">
                <div className="chat-answer-markdown">
                  <ReactMarkdown>{message.answer}</ReactMarkdown>
                </div>
                {message.sources && message.sources.length > 0 && (
                  <details className="chat-sources">
                    <summary>Izvori ({message.sources.length})</summary>
                    <ul>
                      {message.sources.map((source) => (
                        <li key={source.chunkId}>
                          <strong>
                            {multiMode && source.fileName
                              ? `${source.documentType}: ${source.fileName}, strane `
                              : 'Strane '}
                            {source.pageFrom}
                            {source.pageTo !== source.pageFrom ? `–${source.pageTo}` : ''}:
                          </strong>{' '}
                          {source.excerpt}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={multiMode ? 'Postavi pitanje o svim dokumentima…' : 'Postavi pitanje o dokumentu…'}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={asking}
        />
        <button type="submit" disabled={asking || !question.trim()}>
          {asking ? 'Šalje se…' : 'Pošalji'}
        </button>
      </form>
    </main>
  )
}
