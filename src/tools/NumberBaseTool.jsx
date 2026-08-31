import { useState } from 'react'

const bases = [
  { id: '2', name: '二进制 Bin' },
  { id: '8', name: '八进制 Oct' },
  { id: '10', name: '十进制 Dec' },
  { id: '16', name: '十六进制 Hex' },
]

export default function NumberBaseTool() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState('10')
  const [toBase, setToBase] = useState('16')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    setError('')
    const raw = input.trim().replace(/\s+/g, '')
    if (!raw) {
      setOutput('')
      return
    }
    try {
      const value = parseInt(raw, Number(fromBase))
      if (Number.isNaN(value)) {
        setError('输入不是合法的' + bases.find((b) => b.id === fromBase)?.name + '数字')
        setOutput('')
        return
      }
      setOutput(value.toString(Number(toBase)).toUpperCase())
    } catch (e) {
      setError('转换失败：' + e.message)
    }
  }

  const swap = () => {
    setFromBase(toBase)
    setToBase(fromBase)
    if (output) {
      setInput(output)
      setOutput('')
    }
  }

  const copyOutput = () => {
    if (output) navigator.clipboard.writeText(output)
  }

  const selectClass =
    'px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">输入数字</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要转换的数字..."
            className="w-full min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">从</label>
          <select value={fromBase} onChange={(e) => setFromBase(e.target.value)} className={selectClass}>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={swap}
          className="mb-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="交换进制"
        >
          ⇄
        </button>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">转为</label>
          <select value={toBase} onChange={(e) => setToBase(e.target.value)} className={selectClass}>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <button onClick={convert} className="btn-primary text-sm py-2 px-4 mb-1">转换</button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">结果</label>
          {output && (
            <button onClick={copyOutput} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              复制结果
            </button>
          )}
        </div>
        <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-sm text-slate-900 dark:text-slate-100 break-all min-h-[56px]">
          {output || '—'}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}