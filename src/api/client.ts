import type { AskAnswerResponseDto, DocumentDto } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5211'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Zahtev nije uspeo (status ${response.status}).`)
  }
  return response.json() as Promise<T>
}

export function getDocuments(): Promise<DocumentDto[]> {
  return fetch(`${API_BASE_URL}/api/documents`).then((r) => handleResponse(r))
}

export function uploadDocument(file: File): Promise<DocumentDto> {
  const formData = new FormData()
  formData.append('File', file)

  return fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  }).then((r) => handleResponse(r))
}

export function processDocument(id: string): Promise<void> {
  return fetch(`${API_BASE_URL}/api/documents/${id}/process`, {
    method: 'POST',
  }).then((r) => handleResponse(r))
}

export function askQuestion(id: string, question: string): Promise<AskAnswerResponseDto> {
  return fetch(`${API_BASE_URL}/api/documents/${id}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  }).then((r) => handleResponse(r))
}
