import { UIMessage } from 'ai'

interface MessagesProps {
  messages: UIMessage[];
}

export function Messages({ messages }: MessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[60%] px-4 py-3 ${
              message.role === 'user'
                ? 'bg-zinc-700 text-zinc-100 rounded-2xl rounded-br-none'
                : 'text-zinc-100 rounded-2xl'
            }`}
          >
            <p className="whitespace-pre-wrap">
              {message.parts.map((part, index) =>
                part.type === 'text' ? <span key={index}>{part.text}</span> : null
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
