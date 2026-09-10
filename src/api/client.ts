import type { AskAnswerResponseDto, DocumentDto, LoginResponseDto } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5211'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    let message = text

    try {
      const parsed = JSON.parse(text) as { message?: string }
      if (parsed.message) message = parsed.message
    } catch {
      // Response body wasn't JSON — use the raw text as-is.
    }

    throw new ApiError(response.status, message || `Zahtev nije uspeo (status ${response.status}).`)
  }
  return response.json() as Promise<T>
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export function login(username: string, password: string): Promise<LoginResponseDto> {
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then((r) => handleResponse(r))
}

export function getDocuments(token: string): Promise<DocumentDto[]> {
  return fetch(`${API_BASE_URL}/api/documents`, {
    headers: authHeaders(token),
  }).then((r) => handleResponse(r))
}

export function uploadDocument(token: string, file: File): Promise<DocumentDto> {
  const formData = new FormData()
  formData.append('File', file)

  return fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  }).then((r) => handleResponse(r))
}

export function processDocument(token: string, id: string): Promise<void> {
  return fetch(`${API_BASE_URL}/api/documents/${id}/process`, {
    method: 'POST',
    headers: authHeaders(token),
  }).then((r) => handleResponse(r))
}

export function askQuestion(token: string, id: string, question: string): Promise<AskAnswerResponseDto> {
  return fetch(`${API_BASE_URL}/api/documents/${id}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ question }),
  }).then((r) => handleResponse(r))
}
