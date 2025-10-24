'use client'

import { DefaultChatTransport } from 'ai'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

import { Messages } from './messages'
import { SuggestedPrompts } from './suggested-prompts'
import { ChatInputBox } from './chat-input-box'


export function ChatPanel() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input })
      setInput('')
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <SuggestedPrompts onPromptClick={setInput} />
        ) : (
          <Messages messages={messages} />
        )}
      </div>

      <ChatInputBox
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={status !== 'ready'}
      />
    </div>
  )
}
