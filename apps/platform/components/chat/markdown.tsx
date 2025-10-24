import { JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  content: string
  className?: string
  citations?: Record<number, { url: string; title: string }>
}

export function Markdown({ content, className, citations = {} }: MarkdownProps) {
  const renderTextWithCitations = (text: string) => {
    if (!citations || Object.keys(citations).length === 0) {
      return text
    }

    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    const citationRegex = /\[cite:(\d+)\]/g
    let match

    while ((match = citationRegex.exec(text)) !== null) {
      const citationNum = parseInt(match[1])

      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add citation link
      if (citations[citationNum]) {
        parts.push(
          <sup key={`cite-${match.index}`}>
            <a
              href={citations[citationNum].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 no-underline"
              title={citations[citationNum].title}>
              [{match[1]}]
            </a>
          </sup>
        )
      } else {
        parts.push(match[0])
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <div className={className}>
      <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a className="font-semibold text-blue-400 hover:text-blue-300" target="_blank" {...props} />
        ),
        h1: ({ node, children, ...props }) => (
          <h1 className="mt-4 mb-2 font-semibold text-xl" {...props}>
            {children}
          </h1>
        ),
        h2: ({ node, children, ...props }) => (
          <h2 className="my-2 font-medium text-lg" {...props}>
            {children}
          </h2>
        ),
        h3: ({ node, children, ...props }) => (
          <h3 className="my-1 font-medium" {...props}>
            {children}
          </h3>
        ),
        p: ({ node, children, ...props }) => (
          <p className="text-sm leading-relaxed mb-2" {...props}>
            {children}
          </p>
        ),
        // Custom text renderer to handle citations
        // @ts-ignore
        text: ({ node, value, ...props }) => {
          return <>{renderTextWithCitations(value)}</>
        },
        ul: ({ node, children, ...props }) => (
          <ul className="ml-6 list-disc space-y-1 my-2 text-sm" {...props}>
            {children}
          </ul>
        ),
        ol: ({ node, children, ...props }) => (
          <ol className="ml-6 list-decimal space-y-1 my-2 text-sm" {...props}>
            {children}
          </ol>
        ),
        code: ({ node, children, ...props }) => {
          if ('inline' in props && props.inline) {
            return (
              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          }
          return (
            <code className="block bg-zinc-800 p-3 rounded-lg text-sm overflow-x-auto my-2" {...props}>
              {children}
            </code>
          )
        },
        table: ({ node, children, ...props }) => (
          <div className="my-3 w-full overflow-auto rounded-lg border border-zinc-700">
            <table {...props} className="w-full border-collapse">
              {children}
            </table>
          </div>
        ),
        thead: ({ node, children, ...props }) => (
          <thead {...props} className="bg-zinc-800">
          {children}
          </thead>
        ),
        tbody: ({ node, children, ...props }) => (
          <tbody {...props}>
          {children}
          </tbody>
        ),
        th: ({ node, children, ...props }) => (
          <th {...props} className="border border-zinc-700 p-2 font-medium text-left">
            {children}
          </th>
        ),
        td: ({ node, children, ...props }) => (
          <td {...props} className="border border-zinc-700 p-2 text-sm">
            {children}
          </td>
        ),
        hr: ({ node, ...props }) => (
          <hr {...props} className="my-4 border-t border-zinc-700" />
        )
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
