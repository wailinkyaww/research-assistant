import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib'
import { scrapeWebsite, ScrapeResult } from './scraper'

export interface RabbitMQConfig {
    url: string
    inputQueue: string
    outputQueue: string
}

export interface ScrapeRequest {
    url: string
    requestId?: string
}

export class RabbitMQService {
    private connection: Connection | null = null
    private channel: Channel | null = null
    private config: RabbitMQConfig

    constructor(config: RabbitMQConfig) {
        this.config = config
    }

    /**
     * Connect to RabbitMQ and set up channels
     */
    async connect(): Promise<void> {
        try {
            console.log('Connecting to RabbitMQ...')
            this.connection = await amqp.connect(this.config.url)

            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err)
            })

            this.connection.on('close', () => {
                console.log('RabbitMQ connection closed')
            })

            this.channel = await this.connection.createChannel()

            // Assert queues exist
            await this.channel.assertQueue(this.config.inputQueue, {
                durable: true,
            })

            await this.channel.assertQueue(this.config.outputQueue, {
                durable: true,
            })

            // Set prefetch to 1 to process one message at a time
            await this.channel.prefetch(1)

            console.log('Connected to RabbitMQ successfully')
            console.log(`Input queue: ${this.config.inputQueue}`)
            console.log(`Output queue: ${this.config.outputQueue}`)
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error)
            throw error
        }
    }

    /**
     * Start consuming messages from the input queue
     */
    async startConsuming(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized. Call connect() first.')
        }

        console.log(`Starting to consume messages from ${this.config.inputQueue}...`)

        await this.channel.consume(
            this.config.inputQueue,
            async (msg) => {
                if (msg) {
                    await this.handleMessage(msg)
                }
            },
            {
                noAck: false, // Manual acknowledgment
            }
        )
    }

    /**
     * Handle incoming message
     */
    private async handleMessage(msg: ConsumeMessage): Promise<void> {
        if (!this.channel) {
            return
        }

        try {
            const content = msg.content.toString()
            console.log(`Received message: ${content}`)

            // Parse the message - could be just a URL string or a JSON object
            let request: ScrapeRequest
            try {
                const parsed = JSON.parse(content)
                request = {
                    url: parsed.url || content,
                    requestId: parsed.requestId,
                }
            } catch {
                // If not JSON, treat the entire content as URL
                request = {
                    url: content,
                }
            }

            // Scrape the website
            console.log(`Scraping URL: ${request.url}`)
            const result = await scrapeWebsite(request.url)

            // Prepare response
            const response = {
                requestId: request.requestId,
                ...result,
                timestamp: new Date().toISOString(),
            }

            // Send result back
            const replyTo = msg.properties.replyTo || this.config.outputQueue
            const correlationId = msg.properties.correlationId

            await this.sendMessage(replyTo, response, correlationId)

            // Acknowledge the message
            this.channel.ack(msg)

            console.log(`Successfully processed URL: ${request.url}`)
        } catch (error) {
            console.error('Error processing message:', error)

            // Send error response
            try {
                const errorResponse = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString(),
                }

                const replyTo = msg.properties.replyTo || this.config.outputQueue
                const correlationId = msg.properties.correlationId

                await this.sendMessage(replyTo, errorResponse, correlationId)
            } catch (sendError) {
                console.error('Failed to send error response:', sendError)
            }

            // Reject and requeue the message (or don't requeue if it's a persistent error)
            this.channel.nack(msg, false, false)
        }
    }

    /**
     * Send a message to a queue
     */
    private async sendMessage(
        queue: string,
        data: any,
        correlationId?: string
    ): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized')
        }

        const content = Buffer.from(JSON.stringify(data))

        this.channel.sendToQueue(queue, content, {
            persistent: true,
            correlationId,
            contentType: 'application/json',
        })

        console.log(`Sent message to ${queue}`)
    }

    /**
     * Close connection gracefully
     */
    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close()
            }
            if (this.connection) {
                await this.connection.close()
            }
            console.log('RabbitMQ connection closed gracefully')
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error)
        }
    }
}