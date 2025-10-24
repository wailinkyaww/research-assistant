import { ChatPanel } from '@/components/chat/chat-panel'
import { SourcePanel } from '@/components/sources/source-panel'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans px-[5vh]">
      <div className="flex h-[90vh] w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
        <ChatPanel />
        <SourcePanel />
      </div>
    </div>
  )
}
