import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from 'ai'

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

    return data.items.map(item => ({
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

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const result = streamText({
    model: openai('gpt-4o'),
    tools: { webSearch },
    stopWhen: stepCountIs(10),
    system: `You are a helpful research assistant.

Current Date: ${currentDate}

When a user asks you a question:
1. ALWAYS use the webSearch tool to find relevant and up-to-date information
2. Analyze and synthesize the search results
3. Present your findings in a clear, well-structured markdown format

Guidelines:
- Use headings (##, ###) to organize information by topic
- Use bullet points or numbered lists for clarity
- Bold important terms and concepts
- Include relevant details from multiple sources
- Cite sources when appropriate
- Provide a comprehensive, well-researched answer`,
    messages: convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
