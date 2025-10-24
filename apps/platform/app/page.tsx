'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatPanel } from '@/components/chat/chat-panel'
import { SourcePanel } from '@/components/sources/source-panel'

export default function Home() {
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })

  const [sourcePanelWidth, setSourcePanelWidth] = useState(320) // 320px = w-80
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX

      // Min width: 280px, Max width: 600px
      const clampedWidth = Math.max(280, Math.min(600, newWidth))
      setSourcePanelWidth(clampedWidth)
    },
    [isResizing]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add mouse event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-900 font-sans px-[5vh]'>
      <div
        ref={containerRef}
        className='flex h-[90vh] w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg'>
        <div className='flex-1 overflow-hidden'>
          <ChatPanel chat={chat} />
        </div>

        {/* Resizable divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 cursor-col-resize bg-zinc-700 hover:bg-blue-500 transition-colors ${
            isResizing ? 'bg-blue-500' : ''
          }`}
        />

        <div style={{ width: sourcePanelWidth }} className='flex-shrink-0'>
          <SourcePanel messages={chat.messages} />
        </div>
      </div>
    </div>
  )
}
