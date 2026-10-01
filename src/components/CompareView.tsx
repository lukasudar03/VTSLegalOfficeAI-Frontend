import { useState } from 'react'
import { compareDocuments } from '../api/client'
import type { ArticleDiffDto, DocumentComparisonResultDto, DocumentDto } from '../api/types'

interface CompareViewProps {
  token: string
  documents: DocumentDto[]
  onBack: () => void
}

function ArticleCard({ diff, kind }: { diff: ArticleDiffDto; kind: 'added' | 'removed' | 'changed' }) {
  return (
    <div className="compare-article-card">
      <div className="compare-article-number">Član {diff.articleNumber}</div>
      {kind === 'changed' && diff.summary && <div className="compare-article-summary">{diff.summary}</div>}
      {kind !== 'removed' && diff.newText && (
        <details className="compare-article-text">
          <summary>{kind === 'added' ? 'Tekst novog člana' : 'Nova verzija'}</summary>
          <p>{diff.newText}</p>
        </details>
      )}
      {kind !== 'added' && diff.oldText && (
        <details className="compare-article-text">
          <summary>{kind === 'removed' ? 'Tekst uklonjenog člana' : 'Stara verzija'}</summary>
          <p>{diff.oldText}</p>
        </details>
      )}
    </div>
  )
}

export function CompareView({ token, documents, onBack }: CompareViewProps) {
  const [documentId1, setDocumentId1] = useState('')
  const [documentId2, setDocumentId2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DocumentComparisonResultDto | null>(null)

  const processedDocuments = documents.filter((d) => d.status === 'Processed')

  async function handleCompare(event: React.FormEvent) {
    event.preventDefault()
    if (!documentId1 || !documentId2 || documentId1 === documentId2) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const comparison = await compareDocuments(token, documentId1, documentId2)
      setResult(comparison)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Poređenje nije uspelo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-panel">
      <header className="qa-panel-header">
        <button type="button" className="back-button" onClick={onBack}>
          ← Nazad na dokumente
        </button>
        <h2>Poređenje verzija pravilnika</h2>
      </header>

      <div className="admin-content">
        <section className="admin-section admin-create-card">
          <p className="compare-disclaimer">
            Poredi odredbe po broju člana između dva izabrana dokumenta. Najkorisnije je kada su to zaista dve
            verzije istog akta — ako izabereš dva nepovezana dokumenta, poređenje će i dalje raditi, ali rezultat
            neće biti smislen. Sažetke izmena generiše model i treba ih proveriti kod nadležnog lica.
          </p>
          <form className="compare-form" onSubmit={handleCompare}>
            <select value={documentId1} onChange={(e) => setDocumentId1(e.target.value)} required>
              <option value="">Starija verzija…</option>
              {processedDocuments.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === documentId2}>
                  {d.fileName}
                </option>
              ))}
            </select>
            <select value={documentId2} onChange={(e) => setDocumentId2(e.target.value)} required>
              <option value="">Novija verzija…</option>
              {processedDocuments.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === documentId1}>
                  {d.fileName}
                </option>
              ))}
            </select>
            <button type="submit" disabled={loading || !documentId1 || !documentId2}>
              {loading ? 'Poredim…' : 'Uporedi'}
            </button>
          </form>
          {error && <p className="login-error">{error}</p>}
        </section>

        {result && (
          <section className="admin-section admin-create-card">
            <p className="compare-summary-line">
              {result.document1Name} → {result.document2Name}: {result.changed.length} izmenjeno,{' '}
              {result.added.length} dodato, {result.removed.length} uklonjeno, {result.unchangedCount} nepromenjeno.
            </p>

            {result.changed.length > 0 && (
              <div className="compare-group">
                <h3>Izmenjeni članovi</h3>
                {result.changed.map((diff) => (
                  <ArticleCard key={`changed-${diff.articleNumber}`} diff={diff} kind="changed" />
                ))}
              </div>
            )}

            {result.added.length > 0 && (
              <div className="compare-group">
                <h3>Dodati članovi</h3>
                {result.added.map((diff) => (
                  <ArticleCard key={`added-${diff.articleNumber}`} diff={diff} kind="added" />
                ))}
              </div>
            )}

            {result.removed.length > 0 && (
              <div className="compare-group">
                <h3>Uklonjeni članovi</h3>
                {result.removed.map((diff) => (
                  <ArticleCard key={`removed-${diff.articleNumber}`} diff={diff} kind="removed" />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
