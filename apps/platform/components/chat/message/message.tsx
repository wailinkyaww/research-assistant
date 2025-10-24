import { UIMessage } from 'ai'
import { UserMessage } from './user-message'
import { AssistantMessage } from './assistant-message'

export function Message({ message }: { message: UIMessage }) {
  if (message.role === 'user') {
    return <UserMessage message={message} />
  }

  return <AssistantMessage message={message} />
}
