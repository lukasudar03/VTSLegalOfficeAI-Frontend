import type { ChunkSourceDto, ConfidenceLevel } from './types'

export interface ChatMessage {
  id: string
  question: string
  answer?: string
  sources?: ChunkSourceDto[]
  confidence?: ConfidenceLevel
  confidenceNote?: string
  error?: string
  pending: boolean
}
