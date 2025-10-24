import { UIMessage } from 'ai'
import { Markdown } from '../markdown'
import { WebSearchTooCall } from '../tool-calls/web-search'

export function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className='flex justify-start'>
      <div className='max-w-[60%] px-4 py-3 text-zinc-100 rounded-2xl'>
        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            return <Markdown key={index} content={part.text} />
          }

          if (part.type === 'tool-webSearch') {
            // @ts-ignore
            return <WebSearchTooCall key={index} part={part} />
          }

          return null
        })}
      </div>
    </div>
  )
}
