import amqp, { Channel, Connection } from 'amqplib'
import { randomUUID } from 'crypto'

export interface ScrapeResult {
  url: string
  success: boolean
  markdown?: string
  html?: string
  error?: string
  timestamp: string
}

class RabbitMQClient {
  private connection: amqp.ChannelModel | null = null
  private channel: Channel | null = null
  private replyQueue: string | null = null
  private pendingRequests: Map<
    string,
    { resolve: (value: ScrapeResult) => void; reject: (error: Error) => void }
  > = new Map()

  private async ensureConnection(): Promise<void> {
    if (this.connection && this.channel) {
      return
    }

    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

    try {
      this.connection = await amqp.connect(rabbitmqUrl)

      this.connection.on('error', err => {
        console.error('RabbitMQ connection error:', err)
        this.connection = null
        this.channel = null
      })

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed')
        this.connection = null
        this.channel = null
      })

      this.channel = await this.connection.createChannel()

      // Create exclusive reply queue
      const replyQueueResult = await this.channel.assertQueue('', {
        exclusive: true,
        autoDelete: true
      })
      this.replyQueue = replyQueueResult.queue

      // Start consuming from reply queue
      await this.channel.consume(
        this.replyQueue,
        msg => {
          if (!msg) return

          const correlationId = msg.properties.correlationId
          const pending = this.pendingRequests.get(correlationId)

          if (pending) {
            try {
              const response: ScrapeResult = JSON.parse(msg.content.toString())
              pending.resolve(response)
            } catch (error) {
              pending.reject(new Error('Failed to parse response'))
            }
            this.pendingRequests.delete(correlationId)
          }
        },
        { noAck: true }
      )

      console.log('RabbitMQ client connected successfully')
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error)
      throw error
    }
  }

  async scrapeWebPage(url: string, timeoutMs: number = 30000): Promise<ScrapeResult> {
    await this.ensureConnection()

    if (!this.channel || !this.replyQueue) {
      throw new Error('RabbitMQ channel not initialized')
    }

    const correlationId = randomUUID()
    const inputQueue = process.env.RABBITMQ_QUEUE_INPUT || 'scraper-requests'

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(correlationId)
        reject(new Error(`Scraping request timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      // Store pending request
      this.pendingRequests.set(correlationId, {
        resolve: value => {
          clearTimeout(timeout)
          resolve(value)
        },
        reject: error => {
          clearTimeout(timeout)
          reject(error)
        }
      })

      // Send request
      const request = { url }
      const content = Buffer.from(JSON.stringify(request))

      this.channel!.sendToQueue(inputQueue, content, {
        correlationId,
        replyTo: this.replyQueue!,
        contentType: 'application/json'
      })

      console.log(`Sent scrape request for URL: ${url} with correlationId: ${correlationId}`)
    })
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close()
      }
      if (this.connection) {
        await this.connection.close()
      }
      console.log('RabbitMQ client closed')
    } catch (error) {
      console.error('Error closing RabbitMQ client:', error)
    }
  }
}

// Singleton instance
let clientInstance: RabbitMQClient | null = null

export function getRabbitMQClient(): RabbitMQClient {
  if (!clientInstance) {
    clientInstance = new RabbitMQClient()
  }
  return clientInstance
}
