import { useEffect, useState } from 'react'

const examples = [
  'Šta piše u trećem članu ovog dokumenta?',
  'Koji je rok naveden za ovu obavezu?',
  'Sumiraj glavne tačke dokumenta.',
  'Da li dokument pominje neku novčanu kaznu?',
  'Ko su strane pomenute u dokumentu?',
]

function DocumentIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6" strokeLinecap="round" />
      <path d="M9 17h6" strokeLinecap="round" />
      <path d="M9 9h1" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyState() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % examples.length)
        setVisible(true)
      }, 350)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="empty-state">
      <div className="empty-state-glow" />
      <span className="empty-state-dot dot-1" />
      <span className="empty-state-dot dot-2" />
      <span className="empty-state-dot dot-3" />

      <div className="empty-state-icon">
        <DocumentIcon />
      </div>

      <h2>Izaberi dokument da počneš</h2>
      <p className="empty-state-subtitle">Otpremi PDF ili izaberi jedan sa leve strane.</p>

      <p className={`empty-state-example ${visible ? 'visible' : ''}`}>„{examples[index]}"</p>
    </div>
  )
}
