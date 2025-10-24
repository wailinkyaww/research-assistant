import dotenv from 'dotenv'
import { RabbitMQService } from './lib/rabbitmq'

dotenv.config()

const config = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  inputQueue: process.env.RABBITMQ_QUEUE_INPUT || 'scraper-requests',
  outputQueue: process.env.RABBITMQ_QUEUE_OUTPUT || 'scraper-results'
}

async function main() {
  console.log('Starting Web Scraper Service...')
  console.log('Configuration:', {
    url: config.url,
    inputQueue: config.inputQueue,
    outputQueue: config.outputQueue
  })

  const service = new RabbitMQService(config)
  await service.connect()
  await service.startConsuming()

  console.log('Web Scraper Service is running. Press Ctrl+C to stop.')

  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...')
    await service.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...')
    await service.close()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})