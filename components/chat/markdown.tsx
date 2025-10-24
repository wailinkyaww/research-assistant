import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
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
  )
}
