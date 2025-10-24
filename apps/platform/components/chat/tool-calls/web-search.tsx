import { UIToolInvocation } from 'ai'

type UITool = {
  input: {
    searchQuery: string
  }
  output: {
    url: string
    title: string
    excerpt: string
  }[]
}

export function WebSearchTooCall(props: { part: UIToolInvocation<UITool> }) {
  const { part } = props
  const { state, input, output } = part

  return (
    <div className='mt-4 p-4 bg-zinc-800 rounded-lg'>
      {state === 'input-streaming' && <p className='text-sm text-zinc-400'>Searching...</p>}

      {state === 'input-available' && input && (
        <p className='text-sm text-zinc-400'>Searching {input.searchQuery}...</p>
      )}

      {state === 'output-available' && output && (
        <>
          <p className='text-sm text-zinc-400 my-4'>Searched {input.searchQuery}</p>
          <div className='space-y-3'>
            {output.map((entry, idx) => {
              const domain = new URL(entry.url).hostname
              return (
                <div key={idx} className='border-l-2 border-blue-500 pl-3'>
                  <div className='flex items-center gap-2'>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                      alt=''
                      className='w-4 h-4 flex-shrink-0'
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <a
                      href={entry.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-semibold text-blue-400 hover:text-blue-300 text-sm'>
                      {entry.title}
                    </a>
                  </div>
                  <p className='text-xs text-zinc-400 mt-1'>{entry.excerpt}</p>
                  <p className='text-xs text-zinc-500 mt-1'>{entry.url}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
