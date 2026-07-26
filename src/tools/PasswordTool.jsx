import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

export default function PasswordTool() {
  const [length, setLength] = useState(16)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let chars = ''
    if (includeUpper) chars += upper
    if (includeLower) chars += lower
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    if (chars === '') {
      setPassword('请至少选择一种字符类型')
      return
    }

    let result = ''
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    setPassword(result)
  }

  const copyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">长度:</label>
        <input
          type="range"
          min="6"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <span className="text-sm font-mono w-8 text-center">{length}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <input type="checkbox" checked={includeUpper} onChange={(e) => setIncludeUpper(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">大写字母 (A-Z)</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <input type="checkbox" checked={includeLower} onChange={(e) => setIncludeLower(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">小写字母 (a-z)</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">数字 (0-9)</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">特殊符号 (!@#$)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={generatePassword} className="btn-primary text-sm py-2 px-6">
          <RefreshCw className="w-4 h-4 mr-2" />
          生成密码
        </button>
      </div>

      {password && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-mono text-lg break-all text-slate-900 dark:text-white">{password}</span>
            <button onClick={copyPassword} className="btn-secondary text-sm py-2 px-3 shrink-0">
              <Copy className="w-4 h-4 mr-1" />
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                password.length >= 16 ? 'bg-green-500 w-full' :
                password.length >= 12 ? 'bg-yellow-500 w-3/4' :
                password.length >= 8 ? 'bg-orange-500 w-1/2' : 'bg-red-500 w-1/4'
              }`}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            密码强度: {password.length >= 16 ? '强' : password.length >= 12 ? '较强' : password.length >= 8 ? '中等' : '弱'}
          </p>
        </div>
      )}
    </div>
  )
}
