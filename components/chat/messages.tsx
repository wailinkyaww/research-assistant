import { UIMessage } from 'ai'
import { Markdown } from './markdown'

interface MessagesProps {
  messages: UIMessage[];
}

interface MessageProps {
  message: UIMessage;
}

function UserMessage({ message }: MessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[60%] px-4 py-3 bg-zinc-700 text-zinc-100 rounded-2xl rounded-br-none">
        <p className="whitespace-pre-wrap">
          {message.parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null
          )}
        </p>
      </div>
    </div>
  )
}

function AssistantMessage({ message }: MessageProps) {
  const textContent = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')

  return (
    <div className="flex justify-start">
      <div className="max-w-[60%] px-4 py-3 text-zinc-100 rounded-2xl">
        <Markdown content={textContent} />
      </div>
    </div>
  )
}

export function Messages({ messages }: MessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        if (message.role === 'user') {
          return <UserMessage key={message.id} message={message} />
        }

        return <AssistantMessage key={message.id} message={message} />
      })}
    </div>
  )
}
