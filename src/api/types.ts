export type DocumentStatus = 'Uploaded' | 'Processing' | 'Processed'

export interface DocumentDto {
  id: string
  fileName: string
  storedFileName: string
  fileSizeBytes: number
  totalPages: number | null
  status: DocumentStatus
  extractedText: string | null
  uploadedAt: string
}

export interface ChunkSourceDto {
  chunkId: string
  chunkIndex: number
  pageFrom: number
  pageTo: number
  excerpt: string
}

export interface AskAnswerResponseDto {
  answer: string
  sources: ChunkSourceDto[]
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
