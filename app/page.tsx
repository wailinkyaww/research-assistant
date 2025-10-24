import { ChatPanel } from '@/components/chat/chat-panel';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans">
      {/* Container with fixed size */}
      <div className="flex h-[90vh] w-[1400px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
        {/* Chat Panel - Left Side */}
        <ChatPanel />

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
