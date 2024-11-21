import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Scanner } from './scanner'
import { QueueService } from './queue-service'

vi.mock('./queue-service', () => ({
  QueueService: vi.fn().mockImplementation(() => ({
    getSubClient: vi.fn().mockResolvedValue({
      pull: vi.fn()
    }),
    requestMsg: {
      subscription: 'test-subscription',
      maxMessages: 10
    },
    fetchMessages: vi.fn()
  }))
}))

describe('Scanner', () => {
  let scanner: Scanner
  let mockQueueService: jest.Mocked<QueueService>

  beforeEach(() => {
    vi.resetAllMocks()
    mockQueueService = new QueueService() as jest.Mocked<QueueService>
    scanner = new Scanner(mockQueueService)
    // Mock loopPromise to avoid infinite loop
    scanner.loopPromise = vi.fn().mockResolvedValue(undefined)
  })

  describe('startListening', () => {
    it('should initialize subclient and create 5 concurrent loops', async () => {
      // Act
      await scanner.startListening()

      // Assert
      expect(mockQueueService.getSubClient).toHaveBeenCalledTimes(1)
      expect(scanner.loopPromise).toHaveBeenCalledTimes(5)
    })

    it('should wait for all promises to resolve', async () => {
      // Arrange
      let resolveCount = 0
      scanner.loopPromise = vi.fn().mockImplementation(async () => {
        resolveCount++
        await new Promise(resolve => setTimeout(resolve, 10))
        return undefined
      })

      // Act
      await scanner.startListening()

      // Assert
      expect(resolveCount).toBe(5)
    })

    it('should handle getSubClient error', async () => {
      // Arrange
      vi.mocked(mockQueueService.getSubClient).mockRejectedValueOnce(new Error('Failed to get client'))

      // Act & Assert
      await expect(scanner.startListening()).rejects.toThrow('Failed to get client')
      expect(scanner.loopPromise).not.toHaveBeenCalled()
    })

    it('should handle loop promise errors', async () => {
      // Arrange
      scanner.loopPromise = vi.fn()
        .mockRejectedValueOnce(new Error('Loop 1 failed'))
        .mockResolvedValue(undefined)

      // Act & Assert
      await expect(scanner.startListening()).rejects.toThrow('Loop 1 failed')
    })

    it('should set up subclient and subscription request correctly', async () => {
      // Act
      await scanner.startListening()

      // Assert
      expect(scanner.subclient).toBeDefined()
      expect(scanner.subscriptionRequest).toEqual(mockQueueService.requestMsg)
    })

    it('should handle multiple concurrent loop failures', async () => {
      // Arrange
      scanner.loopPromise = vi.fn()
        .mockRejectedValueOnce(new Error('Loop 1 failed'))
        .mockRejectedValueOnce(new Error('Loop 2 failed'))
        .mockResolvedValue(undefined)

      // Act & Assert
      await expect(scanner.startListening()).rejects.toThrow(/Loop [12] failed/)
    })

    it('should maintain correct number of concurrent loops', async () => {
      // Arrange
      const loopPromises: Promise<void>[] = []
      scanner.loopPromise = vi.fn().mockImplementation(() => {
        const promise = new Promise<void>(resolve => setTimeout(resolve, 10))
        loopPromises.push(promise)
        return promise
      })

      // Act
      const startListeningPromise = scanner.startListening()
      
      // Assert
      // Check that all 5 loops are started before any complete
      expect(loopPromises.length).toBe(5)
      
      await startListeningPromise
    })
  })
})
