'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { Messages } from '@/components/chat/messages';
import { SuggestedPrompts } from '@/components/chat/suggested-prompts';

export default function Home() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans">
      {/* Container with fixed size */}
      <div className="flex h-[90vh] w-[1400px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
        {/* Chat Panel - Left Side */}
        <div className="flex flex-1 flex-col">
          {/* Chat Messages Area */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <SuggestedPrompts onPromptClick={setInput} />
            ) : (
              <Messages messages={messages} />
            )}
          </div>

          {/* Chat Input Box - Bottom */}
          <div className="bg-zinc-800 p-8">
            <textarea
              className="w-full resize-none rounded-2xl border border-zinc-600 bg-zinc-700 p-4 text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Ask anything..."
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== 'ready'}
            />
          </div>
        </div>

        {/* Sources Panel - Right Side */}
        <div className="w-80 border-l border-zinc-700 bg-zinc-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Sources</h2>
          <div className="text-sm text-zinc-400">
            {/* Sources will appear here */}
          </div>
        </div>
      </div>
    </div>
  );
}
