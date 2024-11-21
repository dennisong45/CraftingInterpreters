import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScannerService } from './ScannerService'
import { Queue, QueueService } from './Queue'
import { JourneyService } from './JourneyService'

describe('ScannerService', () => {
  let scannerService: ScannerService
  let mockSubclient: any
  let mockFetchMessages: ReturnType<typeof vi.fn>
  let mockCoordinatorSingleton: any
  
  beforeEach(() => {
    mockSubclient = {
      acknowledge: vi.fn().mockResolvedValue({}),
      modifyAckDeadline: vi.fn().mockResolvedValue({})
    }
    mockFetchMessages = vi.fn()
    mockCoordinatorSingleton = {}
    
    QueueService.prototype.fetchMessages = mockFetchMessages
    
    scannerService = new ScannerService()
    // Spy on console.log
    vi.spyOn(console, 'log')
  })

  it('should process message and start journey when message received', async () => {
    const responseMessage = {
      receivedMessages: [{
        message: {
          data: {
            toString: () => 'test message data'
          }
        }
      }]
    }
    mockFetchMessages.mockResolvedValue(responseMessage)

    const promise = scannerService.loopPromise()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify console logs
    expect(console.log).toHaveBeenCalledWith('Message Received')
    
    // Verify JourneyService instantiation and startJourney call
    expect(JourneyService).toHaveBeenCalledWith(
      expect.anything(), // coordinatorSingleton
      expect.anything(), // projectConfig
      'test message data'  // message data
    )
    
    // Verify acknowledgment
    expect(console.log).toHaveBeenCalledWith('Acknowledged')
    expect(mockSubclient.acknowledge).toHaveBeenCalledWith(
      expect.any(Object) // QueueService.makeAckRequest result
    )

    mockFetchMessages.mockRejectedValueOnce(new Error('Stop loop'))
    await expect(promise).rejects.toThrow('Stop loop')
  })

  it('should handle errors in journey processing', async () => {
    const responseMessage = {
      receivedMessages: [{
        message: {
          data: {
            toString: () => 'test message data'
          }
        }
      }]
    }
    mockFetchMessages.mockResolvedValue(responseMessage)
    
    // Mock JourneyService to throw error
    vi.spyOn(JourneyService.prototype, 'startJourney')
      .mockRejectedValue(new Error('Journey error'))

    const promise = scannerService.loopPromise()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify error handling
    expect(console.log).toHaveBeenCalledWith('Error in Dora', expect.any(Error))
    expect(mockSubclient.modifyAckDeadline).toHaveBeenCalledWith(
      expect.any(Object) // QueueService.makeNackRequest result
    )

    mockFetchMessages.mockRejectedValueOnce(new Error('Stop loop'))
    await expect(promise).rejects.toThrow('Stop loop')
  })

  it('should log when no message received', async () => {
    mockFetchMessages.mockResolvedValue(null)

    const promise = scannerService.loopPromise()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(console.log).toHaveBeenCalledWith('No Message For Dora', null)

    mockFetchMessages.mockRejectedValueOnce(new Error('Stop loop'))
    await expect(promise).rejects.toThrow('Stop loop')
  })
})
