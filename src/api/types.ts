export type DocumentStatus = 'Uploaded' | 'Processing' | 'Processed'
export type DocumentType = 'Zakon' | 'Pravilnik'
export type ConfidenceLevel = 'NISKA' | 'SREDNJA' | 'VISOKA'

export interface DocumentDto {
  id: string
  fileName: string
  storedFileName: string
  fileSizeBytes: number
  totalPages: number | null
  status: DocumentStatus
  documentType: DocumentType
  extractedText: string | null
  uploadedAt: string
}

export interface ChunkSourceDto {
  chunkId: string
  chunkIndex: number
  pageFrom: number
  pageTo: number
  excerpt: string
  documentId: string
  fileName: string
  documentType: DocumentType
  isRelatedProvision: boolean
}

export interface ChatMessageDto {
  id: string
  question: string
  answer: string
  sources: ChunkSourceDto[]
  confidence: ConfidenceLevel
  confidenceNote: string
  deadlineAmount: number | null
  deadlineUnit: string | null
  createdAt: string
}

export interface LoginResponseDto {
  token: string
  expiresAt: string
  username: string
  isAdmin: boolean
}

export interface UserDto {
  id: string
  username: string
  email: string
  isAdmin: boolean
  emailVerified: boolean
  createdAt: string
}
