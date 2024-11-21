import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Scanner } from './scanner'
import { QueueService } from './Queue'
import { v1 } from '@google-cloud/pubsub'

const mockSubscriberClient = {
  pull: vi.fn()
} as unknown as v1.SubscriberClient

vi.mock('./Queue', () => ({
  QueueService: vi.fn().mockImplementation(() => ({
    getSubClient: vi.fn().mockResolvedValue(mockSubscriberClient),
    fetchMessages: vi.fn().mockResolvedValue({
      receivedMessages: [{
        message: { data: Buffer.from('test message') }
      }]
    }),
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
  })

  describe('loopPromise', () => {
    it('should process messages in a loop until error occurs', async () => {
      // Arrange
      let loopCount = 0
      vi.mocked(mockQueueService.fetchMessages).mockImplementation(async () => {
        loopCount++
        if (loopCount >= 3) {
          // Stop the loop after 3 iterations
          throw new Error('Stop loop')
        }
        return {
          receivedMessages: [{
            message: { data: Buffer.from('test message') }
          }]
        }
      })

      // Act
      try {
        await scanner.loopPromise()
      } catch (error) {
        expect(error.message).toBe('Stop loop')
      }

      // Assert
      expect(loopCount).toBe(3)
      expect(mockQueueService.fetchMessages).toHaveBeenCalledTimes(3)
    })

    it('should process different types of messages', async () => {
      // Arrange
      const messages = [
        { data: 'message1' },
        { data: 'message2' },
        { data: 'message3' }
      ]
      
      let messageIndex = 0
      vi.mocked(mockQueueService.fetchMessages).mockImplementation(async () => {
        if (messageIndex >= messages.length) {
          throw new Error('Stop loop')
        }
        
        return {
          receivedMessages: [{
            message: { 
              data: Buffer.from(messages[messageIndex++].data) 
            }
          }]
        }
      })

      // Mock startJourney if you have it
      scanner.startJourney = vi.fn()

      // Act
      try {
        await scanner.loopPromise()
      } catch (error) {
        expect(error.message).toBe('Stop loop')
      }

      // Assert
      expect(scanner.startJourney).toHaveBeenCalledTimes(3)
      expect(messageIndex).toBe(3)
    })

    it('should handle empty message responses', async () => {
      // Arrange
      let loopCount = 0
      vi.mocked(mockQueueService.fetchMessages).mockImplementation(async () => {
        loopCount++
        if (loopCount >= 3) {
          throw new Error('Stop loop')
        }
        return { receivedMessages: [] }
      })

      // Act
      try {
        await scanner.loopPromise()
      } catch (error) {
        expect(error.message).toBe('Stop loop')
      }

      // Assert
      expect(loopCount).toBe(3)
      expect(mockQueueService.fetchMessages).toHaveBeenCalledTimes(3)
    })

    it('should handle fetch errors and continue loop', async () => {
      // Arrange
      let loopCount = 0
      vi.mocked(mockQueueService.fetchMessages).mockImplementation(async () => {
        loopCount++
        if (loopCount === 1) {
          throw new Error('Fetch failed')
        }
        if (loopCount >= 3) {
          throw new Error('Stop loop')
        }
        return { receivedMessages: [] }
      })

      // Act
      try {
        await scanner.loopPromise()
      } catch (error) {
        expect(error.message).toBe('Stop loop')
      }

      // Assert
      expect(loopCount).toBe(3)
    })
  })
})
