import { useState } from 'react'

export default function RegexTool() {
  const [pattern, setPattern] = useState('[a-z]+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('Hello World 123')
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, flags)
      const result = text.match(regex) || []
      setMatches(result)
      setError('')
    } catch (e) {
      setError('正则表达式错误：' + e.message)
      setMatches([])
    }
  }

  const highlightMatches = () => {
    try {
      const regex = new RegExp(`(${pattern})`, flags.includes('g') ? flags.replace('g', '') : flags)
      const parts = text.split(regex)
      return parts.map((part, i) => {
        if (regex.test(part)) {
          regex.lastIndex = 0
          return (
            <mark key={i} className="bg-primary-200 dark:bg-primary-800 text-slate-900 dark:text-white rounded px-0.5">
              {part}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })
    } catch {
      return text
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">正则表达式</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">标志</label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">测试文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <button onClick={testRegex} className="btn-primary text-sm py-2 px-6">测试匹配</button>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {!error && matches.length > 0 && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-mono text-sm leading-relaxed">
            {highlightMatches()}
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">匹配结果 ({matches.length} 个):</p>
            <ul className="space-y-1 text-sm font-mono text-slate-600 dark:text-slate-400">
              {matches.map((match, i) => (
                <li key={i} className="break-all">{i + 1}. {match}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
