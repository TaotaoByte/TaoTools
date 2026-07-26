import { useState } from 'react'

export default function TextDiff() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const renderDiff = () => {
    const leftLines = left.split('\n')
    const rightLines = right.split('\n')
    const maxLen = Math.max(leftLines.length, rightLines.length)
    const result = []

    for (let i = 0; i < maxLen; i++) {
      const l = leftLines[i] || ''
      const r = rightLines[i] || ''
      if (l === r) {
        result.push(
          <div key={i} className="flex">
            <div className="w-1/2 p-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">{l || ' '}</div>
            <div className="w-1/2 p-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">{r || ' '}</div>
          </div>
        )
      } else {
        result.push(
          <div key={i} className="flex">
            <div className="w-1/2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 line-through">{l || ' '}</div>
            <div className="w-1/2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">{r || ' '}</div>
          </div>
        )
      }
    }
    return result
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">原始文本</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">对比文本</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="输入对比文本..."
            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {(left || right) && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="w-1/2 p-2 border-r border-slate-200 dark:border-slate-700">原始</div>
            <div className="w-1/2 p-2">对比</div>
          </div>
          <div className="text-sm font-mono">{renderDiff()}</div>
        </div>
      )}
    </div>
  )
}
