import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai'

const webSearch = tool({
  description:
    'Search to get most relevant web pages title, links, and excerpt.',
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
        title: string;
        link: string;
        snippet: string;
      }[];
    } = await response.json()

    if (!data.items) {
      return []
    }

    return data.items.map((item) => ({
      url: item.link,
      title: item.title,
      excerpt: item.snippet
    }))
  }
})

// allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4.1'),
    tools: { webSearch },
    system: 'You are a helpful research assistant.',
    messages: convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
