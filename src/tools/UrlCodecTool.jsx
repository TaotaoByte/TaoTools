import { useState } from 'react'

export default function UrlCodecTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
      setError('')
    } catch (e) {
      setError('转换失败：' + e.message)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          URL 编码
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          URL 解码
        </button>
        <button onClick={handleConvert} className="btn-primary text-sm py-2 px-4">转换</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {mode === 'encode' ? '原始文本' : '编码后的 URL 字符串'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本或 URL...' : '输入要解码的 URL 编码...'}
            className="w-full h-64 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
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