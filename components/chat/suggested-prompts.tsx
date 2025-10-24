interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  const prompts = [
    'Summarize recent developments in quantum computing',
    'Compare pros and cons of React vs Vue',
    'Explain the causes of climate change',
    'Research best practices for remote team management',
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-8 text-3xl font-semibold text-zinc-100">
        Research Assistant
      </h1>
      <p className="mb-8 text-center text-zinc-400">
        Ask me anything and I&#39;ll help you research, summarize, and organize information
      </p>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="flex items-start rounded-xl border border-zinc-600 bg-zinc-700/50 p-4 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
