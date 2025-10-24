'use client'

import { useMemo } from 'react'
import { UIMessage } from 'ai'

interface SourcePanelProps {
  messages: UIMessage[]
}

interface Source {
  id: number
  url: string
  title: string
  excerpt: string
}

export function SourcePanel({ messages }: SourcePanelProps) {
  // Extract all sources from webSearch tool calls
  const sources = useMemo(() => {
    const sourceMap = new Map<string, Source>()

    messages.forEach(message => {
      message.parts.forEach(part => {
        if (part.type === 'tool-webSearch' && part.state === 'output-available' && part.output) {
          // @ts-ignore
          part.output.forEach((result: any) => {
            // Use URL as unique key to avoid duplicates
            if (!sourceMap.has(result.url)) {
              sourceMap.set(result.url, {
                id: result.id,
                url: result.url,
                title: result.title,
                excerpt: result.excerpt
              })
            }
          })
        }
      })
    })

    return Array.from(sourceMap.values()).sort((a, b) => a.id - b.id)
  }, [messages])

  return (
    <div className='flex h-full flex-col border-zinc-700 bg-zinc-800'>
      <div className='border-b border-zinc-700 bg-zinc-800 p-6'>
        <h2 className='text-lg font-semibold text-zinc-100'>Sources</h2>
        <p className='mt-1 text-xs text-zinc-500'>{sources.length} sources</p>
      </div>

      <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
        {sources.length === 0 ? (
          <p className='text-sm text-zinc-400'>No sources yet. Start a conversation to see sources.</p>
        ) : (
          <div className='space-y-4'>
            {sources.map(source => {
              const domain = new URL(source.url).hostname
              return (
                <div key={source.url} className='rounded-lg border border-zinc-700 bg-zinc-900 p-3'>
                  <div className='mb-2'>
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block font-semibold text-blue-400 hover:text-blue-300 text-sm line-clamp-2'>
                      {source.title}
                    </a>
                    <div className='mt-1 flex items-center gap-1'>
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                        alt=''
                        className='h-3 w-3 flex-shrink-0'
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <p className='text-xs text-zinc-500 truncate'>{domain}</p>
                    </div>
                  </div>
                  <p className='text-xs text-zinc-400 line-clamp-2'>{source.excerpt}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
