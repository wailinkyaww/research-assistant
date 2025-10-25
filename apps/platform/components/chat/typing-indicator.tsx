export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-0.5">
        <span className="text-2xl text-white animate-bounce [animation-delay:0ms]">•</span>
        <span className="text-2xl text-white animate-bounce [animation-delay:150ms]">•</span>
        <span className="text-2xl text-white animate-bounce [animation-delay:300ms]">•</span>
      </div>
    </div>
  )
}
