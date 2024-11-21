import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Scanner } from './scanner'
import { QueueService } from './Queue'
import { v1 } from '@google-cloud/pubsub'

// Create proper mock for SubscriberClient
const mockSubscriberClient = {
  pull: vi.fn()
} as unknown as v1.SubscriberClient

vi.mock('./Queue', () => ({
  QueueService: vi.fn().mockImplementation(() => ({
    // Methods
    getSubClient: vi.fn().mockResolvedValue(mockSubscriberClient),
    fetchMessages: vi.fn().mockResolvedValue(undefined),
    // Properties
    requestMsg: {
      subscription: 'test-subscription',
      maxMessages: 10
    }
  }))
}))

describe('Scanner', () => {
  let scanner: Scanner
  let mockQueueService: QueueService

  beforeEach(() => {
    vi.resetAllMocks()
    mockQueueService = new QueueService()
    scanner = new Scanner(mockQueueService)
    scanner.loopPromise = vi.fn().mockResolvedValue(undefined)
  })

  describe('startListening', () => {
    it('should initialize subclient and create 5 concurrent loops', async () => {
      // Act
      await scanner.startListening()

      // Assert
      expect(mockQueueService.getSubClient).toHaveBeenCalled()
      expect(scanner.loopPromise).toHaveBeenCalledTimes(5)
    })
  })
})
