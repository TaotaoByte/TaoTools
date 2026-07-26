import { useState } from 'react'

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const formatJson = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, 2))
      setError('')
    } catch (e) {
      setError('JSON 格式错误：' + e.message)
    }
  }

  const compressJson = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj))
      setError('')
    } catch (e) {
      setError('JSON 格式错误：' + e.message)
    }
  }

  const escapeJson = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(JSON.stringify(obj)))
      setError('')
    } catch (e) {
      setError('JSON 格式错误：' + e.message)
    }
  }

  const unescapeJson = () => {
    try {
      const str = JSON.parse(input)
      const obj = JSON.parse(str)
      setOutput(JSON.stringify(obj, null, 2))
      setError('')
    } catch (e) {
      setError('转义 JSON 格式错误：' + e.message)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={formatJson} className="btn-primary text-sm py-2 px-4">格式化</button>
        <button onClick={compressJson} className="btn-secondary text-sm py-2 px-4">压缩</button>
        <button onClick={escapeJson} className="btn-secondary text-sm py-2 px-4">转义</button>
        <button onClick={unescapeJson} className="btn-secondary text-sm py-2 px-4">反转义</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "TaoTools", "version": "1.0.0"}'
            className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">输出</label>
            {output && (
              <button onClick={copyOutput} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                复制结果
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none"
          />
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
