import { UIMessage } from 'ai'
import { Message } from './message/message'

export function Messages({ messages }: { messages: UIMessage[] }) {
  return (
    <div className='space-y-4'>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  )
}
