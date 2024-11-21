Crafting Interpreters Notes
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { v1 } from '@google-cloud/pubsub'
import { QueueService } from './queue-service' // adjust path as needed

// Mock Google Cloud PubSub
vi.mock('@google-cloud/pubsub', () => {
  return {
    v1: {
      SubscriberClient: vi.fn().mockImplementation(() => ({
        projectPath: vi.fn().mockReturnValue('test-project-path'),
        subscriptionPath: vi.fn().mockReturnValue('test-subscription-path'),
        acknowledge: vi.fn().mockResolvedValue([]),
        pull: vi.fn().mockImplementation(() => [{
          receivedMessages: [{
            message: { data: Buffer.from('test message'), },
            ackId: 'test-ack-id'
          }]
        }])
      }))
    }
  }
})

describe('QueueService', () => {
  let queueService: QueueService
  let mockSubClient: v1.SubscriberClient

  beforeEach(() => {
    queueService = new QueueService()
    mockSubClient = new v1.SubscriberClient()
  })

  describe('getSubClient', () => {
    it('should create and return a subscriber client', async () => {
      // Act
      const client = await queueService.getSubClient()

      // Assert
      expect(client).toBeDefined()
      expect(client.projectPath).toBeDefined()
      expect(client.subscriptionPath).toBeDefined()
    })

    it('should handle client creation errors', async () => {
      // Arrange
      vi.mocked(v1.SubscriberClient).mockImplementationOnce(() => {
        throw new Error('Failed to create client')
      })

      // Act & Assert
      await expect(queueService.getSubClient()).rejects.toThrow('Failed to create client')
    })
  })

  describe('fetchMessages', () => {
    it('should fetch messages successfully', async () => {
      // Arrange
      const subscriptionRequest = {
        subscription: 'test-subscription',
        project: 'test-project',
        maxMessages: 10
      }

      // Act
      const result = await queueService.fetchMessages(mockSubClient, subscriptionRequest)

      // Assert
      expect(result).toBeDefined()
      expect(mockSubClient.pull).toHaveBeenCalled()
      expect(mockSubClient.subscriptionPath).toHaveBeenCalledWith(
        subscriptionRequest.project,
        subscriptionRequest.subscription
      )
    })

    it('should handle empty message responses', async () => {
      // Arrange
      vi.mocked(mockSubClient.pull).mockResolvedValueOnce([{ receivedMessages: [] }])
      
      const subscriptionRequest = {
        subscription: 'test-subscription',
        project: 'test-project',
        maxMessages: 10
      }

      // Act
      const result = await queueService.fetchMessages(mockSubClient, subscriptionRequest)

      // Assert
      expect(result.receivedMessages).toHaveLength(0)
    })

    it('should handle pull errors', async () => {
      // Arrange
      vi.mocked(mockSubClient.pull).mockRejectedValueOnce(new Error('Pull failed'))
      
      const subscriptionRequest = {
        subscription: 'test-subscription',
        project: 'test-project',
        maxMessages: 10
      }

      // Act & Assert
      await expect(queueService.fetchMessages(mockSubClient, subscriptionRequest))
        .rejects.toThrow('Pull failed')
    })

    it('should respect maxMessages parameter', async () => {
      // Arrange
      const subscriptionRequest = {
        subscription: 'test-subscription',
        project: 'test-project',
        maxMessages: 5
      }

      // Act
      await queueService.fetchMessages(mockSubClient, subscriptionRequest)

      // Assert
      expect(mockSubClient.pull).toHaveBeenCalledWith({
        subscription: expect.any(String),
        maxMessages: 5
      })
    })

    it('should correctly format received messages', async () => {
      // Arrange
      const testMessage = 'test message data'
      vi.mocked(mockSubClient.pull).mockResolvedValueOnce([{
        receivedMessages: [{
          message: {
            data: Buffer.from(testMessage),
            attributes: { key: 'value' }
          },
          ackId: 'test-ack-id'
        }]
      }])

      const subscriptionRequest = {
        subscription: 'test-subscription',
        project: 'test-project',
        maxMessages: 10
      }

      // Act
      const result = await queueService.fetchMessages(mockSubClient, subscriptionRequest)

      // Assert
      expect(result.receivedMessages[0]).toEqual({
        message: {
          data: Buffer.from(testMessage),
          attributes: { key: 'value' }
        },
        ackId: 'test-ack-id'
      })
    })
  })
})
