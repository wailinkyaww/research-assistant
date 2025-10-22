'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: 'Hello, how can you help me?' },
    { role: 'assistant', content: 'I can help you with research and answer your questions. What would you like to know?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }]);
      setInput('');

      // Simulate assistant response
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'This is a simulated response.' }]);
      }, 500);
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
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[60%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'text-zinc-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input Box - Bottom */}
          <div className="bg-zinc-800 p-8">
            <textarea
              className="w-full resize-none rounded-2xl border border-zinc-600 bg-zinc-700 p-4 text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask anything..."
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
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
