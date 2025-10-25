'use client'

import { useState } from 'react'

import { Messages } from './messages'
import { SuggestedPrompts } from './suggested-prompts'
import { ChatInputBox } from './chat-input-box'
import { TypingIndicator } from './typing-indicator'
import { useChat } from '@ai-sdk/react'

export function ChatPanel({ chat }: { chat: ReturnType<typeof useChat> }) {
  const { messages, sendMessage, status } = chat
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input })
      setInput('')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <SuggestedPrompts onPromptClick={setInput} />
          </div>
        ) : (
          <div className="p-6">
            <Messages messages={messages} />

            {status === 'submitted' && (
              <TypingIndicator />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700">
        <ChatInputBox
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={status !== 'ready'}
        />
      </div>
    </div>
  )
}
