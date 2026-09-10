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
