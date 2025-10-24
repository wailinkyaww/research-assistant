import { NextRequest, NextResponse } from 'next/server'
import { getRabbitMQClient } from '@/lib/rabbitmq-client'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 })
    }

    // Get RabbitMQ client and scrape the page
    const client = getRabbitMQClient()
    const result = await client.scrapeWebPage(url, 30000)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test scraper error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}