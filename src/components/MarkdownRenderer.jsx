import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { cn } from '../utils/helpers.js'

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
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-1.5 py-1 rounded border border-slate-600/60 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150"
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
    // 说明：项目未安装 @tailwindcss/typography，prose 类目前不生效，
    // 因此这里用任意变体补一层克制的排版规则（标题层级、列表符号、行内代码、链接、引用、表格）。
    <div
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none',
        '[&_p]:my-2.5 [&_p]:leading-relaxed',
        '[&_h1]:mt-7 [&_h1]:mb-2.5 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900 dark:[&_h1]:text-white',
        '[&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-slate-900 dark:[&_h4]:text-white',
        '[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:my-1 [&_li]:leading-relaxed',
        '[&_a]:text-primary-700 dark:[&_a]:text-primary-400 [&_a]:underline [&_a]:underline-offset-2',
        '[&_strong]:font-semibold',
        '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 dark:[&_blockquote]:border-slate-600 [&_blockquote]:pl-3 [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400',
        '[&_hr]:my-5 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-700',
        '[&_table]:my-3 [&_table]:w-full [&_table]:text-[13px]',
        '[&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium',
        '[&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-700 [&_td]:px-2 [&_td]:py-1',
        className,
      )}
    >
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeStr = String(children).replace(/\n$/, '')
            return !inline && match ? (
              <CodeBlock language={match[1]} code={codeStr} {...props} />
            ) : (
              <code
                className={cn(
                  'rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800',
                  'px-1 py-0.5 font-mono text-[12px] text-slate-800 dark:text-slate-200',
                  className,
                )}
                {...props}
              >
                {children}
              </code>
            )
          },
          h2({ children }) {
            return (
              <h2
                id={String(children).toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-24 mt-7 mb-2.5 text-[17px] sm:text-lg font-semibold text-slate-900 dark:text-white"
              >
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3
                id={String(children).toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-24 mt-5 mb-2 text-[15px] font-semibold text-slate-900 dark:text-white"
              >
                {children}
              </h3>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
