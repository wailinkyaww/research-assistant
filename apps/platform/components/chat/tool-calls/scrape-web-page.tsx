import { UIToolInvocation } from 'ai'

type UITool = {
  input: {
    targetUrl: string
  }
  output: {
    success: boolean
    url?: string
    markdown?: string
    scrapedAt?: string
    error?: string
  }
}

export function ScrapeWebPageToolCall(props: { part: UIToolInvocation<UITool> }) {
  const { part } = props
  const { state, input, output } = part

  return (
    <div className='mt-4 bg-zinc-800 rounded-lg'>
      {state === 'input-streaming' && <p className='text-sm text-zinc-400'>Reading...</p>}

      {state === 'input-available' && input && (
        <p className='text-sm text-zinc-400'>Reading {new URL(input.targetUrl).hostname}...</p>
      )}

      {state === 'output-available' && output && (
        <>
          {output.success && output.url ? (
            <div className='flex items-center gap-2'>
              <span className='text-sm text-zinc-400'>Read</span>
              <img
                src={`https://www.google.com/s2/favicons?domain=${new URL(output.url).hostname}&sz=16`}
                alt=''
                className='w-4 h-4 flex-shrink-0'
                onError={e => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <a
                href={output.url}
                target='_blank'
                rel='noopener noreferrer'
                className='font-semibold text-blue-400 hover:text-blue-300 text-sm'>
                {new URL(output.url).hostname}
              </a>
            </div>
          ) : (
            <p className='text-sm text-zinc-400'>
              Failed to read {input?.targetUrl && new URL(input.targetUrl).hostname}
              {output.error && ` • ${output.error}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}
