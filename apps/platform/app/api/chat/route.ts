import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from 'ai'
import { getRabbitMQClient } from '@/lib/rabbitmq-client'

const webSearch = tool({
  description: 'Search to get most relevant web pages title, links, and excerpt.',
  inputSchema: z.object({
    searchQuery: z.string().describe('Search Query')
  }),
  execute: async ({ searchQuery }) => {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

    if (!apiKey || !searchEngineId) {
      return 'Error: Search API credentials not configured!'
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.append('cx', searchEngineId)
    url.searchParams.append('key', apiKey)
    url.searchParams.append('q', searchQuery)
    url.searchParams.append('safe', 'active')

    const response = await fetch(url.toString())

    if (!response.ok) {
      return `Search API error: ${response.status} ${response.statusText}`
    }

    const data: {
      items?: {
        title: string
        link: string
        snippet: string
      }[]
    } = await response.json()

    if (!data.items) {
      return []
    }

    return data.items.map((item, index) => ({
      id: index + 1,
      url: item.link,
      title: item.title,
      excerpt: item.snippet
    }))
  }
})

const scrapeWebPage = tool({
  description:
    'Scrape a web page and convert it to clean, LLM-friendly Markdown. Use this after getting search results to fetch and analyze the full content of interesting pages.',
  inputSchema: z.object({
    targetUrl: z.string().describe('The URL of the web page to scrape')
  }),
  execute: async ({ targetUrl }) => {
    try {
      const client = getRabbitMQClient()
      const result = await client.scrapeWebPage(targetUrl, 30000)

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Unknown error occurred while scraping'
        }
      }

      return {
        success: true,
        url: result.url,
        markdown: result.markdown,
        scrapedAt: result.timestamp
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape web page'
      }
    }
  }
})

// allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const result = streamText({
    model: openai('gpt-4o'),
    tools: { webSearch, scrapeWebPage },
    stopWhen: stepCountIs(50),
    system: `You are a helpful research assistant.

Current Date: ${currentDate}

When a user asks you a question:
1. ALWAYS use the webSearch tool to find relevant and up-to-date information
2. When you find interesting or relevant pages, use scrapeWebPage to get the full content
3. Analyze and synthesize the search results and scraped content
4. Present your findings in a clear, well-structured markdown format

Guidelines:
- Use headings (##, ###) to organize information by topic
- Use bullet points or numbered lists for clarity
- Bold important terms and concepts
- Include relevant details from multiple sources
- **IMPORTANT: Cite sources from webSearch results using the format [cite:n] where n is the id from the search results**
  - Example: "Quantum computing is advancing rapidly [cite:1]."
  - When referencing information from webSearch results, add the citation immediately after the relevant statement
  - Each webSearch result has an 'id' field - use this id for citations
  - You can cite the same source multiple times
  - ALWAYS use the exact format [cite:n] - this is critical for proper rendering
  - Note: You do NOT need to cite scraped pages - only cite the original webSearch results
- Provide a comprehensive, well-researched answer`,
    messages: convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
