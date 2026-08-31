import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

// 带复制按钮的代码块
function CodeBlock({ language, code, ...props }) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // 兜底：临时 textarea + execCommand
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? '已复制' : '复制代码'}
        title={copied ? '已复制' : '复制代码'}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-100 text-xs opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? '已复制' : '复制'}
      </button>
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={language}
        PreTag="div"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '' }) {
  const { theme } = useTheme()

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeStr = String(children).replace(/\n$/, '')
            return !inline && match ? (
              <CodeBlock language={match[1]} code={codeStr} {...props} />
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
