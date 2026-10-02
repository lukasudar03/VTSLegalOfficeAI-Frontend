import type { ChunkSourceDto, ConfidenceLevel } from './types'

export interface ChatMessage {
  id: string
  question: string
  answer?: string
  sources?: ChunkSourceDto[]
  confidence?: ConfidenceLevel
  confidenceNote?: string
  deadlineAmount?: number | null
  deadlineUnit?: string | null
  deadlineComputedDueDate?: string
  isDraftRequest?: boolean
  error?: string
  pending: boolean
}
