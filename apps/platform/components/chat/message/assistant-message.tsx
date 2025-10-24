'use client'

import { useMemo } from 'react'
import { UIMessage } from 'ai'
import { Markdown } from '../markdown'
import { WebSearchTooCall } from '../tool-calls/web-search'
import { ScrapeWebPageToolCall } from '../tool-calls/scrape-web-page'

export function AssistantMessage({ message }: { message: UIMessage }) {
  // Check if there are any tool calls in the message
  const hasTools = useMemo(
    () =>
      message.parts.some(
        part => part.type === 'tool-webSearch' || part.type === 'tool-scrapeWebPage'
      ),
    [message.parts]
  )

  // Build citation map from search results only
  const citations = useMemo(() => {
    const citationMap: Record<number, { url: string; title: string }> = {}

    message.parts.forEach(part => {
      if (part.type === 'tool-webSearch' && part.state === 'output-available' && part.output) {
        // @ts-ignore
        part.output.forEach((result: any) => {
          if (result.id) {
            citationMap[result.id] = {
              url: result.url,
              title: result.title
            }
          }
        })
      }
    })

    return citationMap
  }, [message.parts])

  return (
    <div className='flex justify-start'>
      <div className='max-w-[60%] px-4 py-3 text-zinc-100 rounded-2xl'>
        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <Markdown
                key={index}
                content={part.text}
                className={hasTools ? 'mt-6' : ''}
                citations={citations}
              />
            )
          }

          if (part.type === 'tool-webSearch') {
            // @ts-ignore
            return <WebSearchTooCall key={index} part={part} />
          }

          if (part.type === 'tool-scrapeWebPage') {
            // @ts-ignore
            return <ScrapeWebPageToolCall key={index} part={part} />
          }

          return null
        })}
      </div>
    </div>
  )
}
