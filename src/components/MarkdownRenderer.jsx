import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext.jsx'

export function MarkdownRenderer({ content }) {
  const { theme } = useTheme()

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={theme === 'dark' ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          h2({ children }) {
            return <h2 id={String(children).toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-24">{children}</h2>
          },
          h3({ children }) {
            return <h3 id={String(children).toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-24">{children}</h3>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
