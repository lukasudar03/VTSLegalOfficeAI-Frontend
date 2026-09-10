import type { ChunkSourceDto } from './types'

export interface ChatMessage {
  id: string
  question: string
  answer?: string
  sources?: ChunkSourceDto[]
  error?: string
  pending: boolean
}
