import { useState } from 'react'
import type { ChatMessage } from '../api/chat'
import type { DocumentDto } from '../api/types'

interface QaPanelProps {
  document: DocumentDto | null
  messages: ChatMessage[]
  asking: boolean
  onAsk: (question: string) => void
}

export function QaPanel({ document, messages, asking, onAsk }: QaPanelProps) {
  const [question, setQuestion] = useState('')

  if (!document) {
    return (
      <main className="qa-panel qa-panel-empty">
        <p>Izaberi dokument sa leve strane, ili otpremi novi PDF.</p>
      </main>
    )
  }

  if (document.status !== 'Processed') {
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

  return (
    <main className="qa-panel">
      <header className="qa-panel-header">
        <h2>{document.fileName}</h2>
        <span className="qa-panel-meta">{document.totalPages} strana</span>
      </header>

      <div className="chat-log">
        {messages.length === 0 && (
          <p className="chat-empty">Postavi pitanje o sadržaju ovog dokumenta.</p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="chat-entry">
            <div className="chat-question">{message.question}</div>

            {message.pending && <div className="chat-answer pending">Razmišljam…</div>}

            {message.error && <div className="chat-answer error">{message.error}</div>}

            {message.answer && (
              <div className="chat-answer">
                <p>{message.answer}</p>
                {message.sources && message.sources.length > 0 && (
                  <details className="chat-sources">
                    <summary>Izvori ({message.sources.length})</summary>
                    <ul>
                      {message.sources.map((source) => (
                        <li key={source.chunkId}>
                          <strong>
                            Strane {source.pageFrom}
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
        <input
          type="text"
          placeholder="Postavi pitanje o dokumentu…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={asking}
        />
        <button type="submit" disabled={asking || !question.trim()}>
          {asking ? 'Šalje se…' : 'Pošalji'}
        </button>
      </form>
    </main>
  )
}
