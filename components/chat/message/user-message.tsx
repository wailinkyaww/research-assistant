import { UIMessage } from 'ai'

export function UserMessage({ message }: { message: UIMessage }) {
  return (
    <div className='flex justify-end'>
      <div className='max-w-[60%] px-4 py-3 bg-zinc-700 text-zinc-100 rounded-2xl rounded-br-none'>
        <p className='whitespace-pre-wrap'>
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null
          )}
        </p>
      </div>
    </div>
  )
}
