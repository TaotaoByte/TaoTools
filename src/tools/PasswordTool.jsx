import { useEffect, useMemo, useState } from 'react'
import { Copy, RefreshCw, Check, Trash2, History } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const DEFAULT_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const AMBIGUOUS = "0O1lI|`'\""

// 无偏随机整数 [0, max)
function randInt(max) {
  if (max <= 1) return 0
  const buf = new Uint32Array(1)
  const limit = Math.floor(4294967295 / max) * max
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return buf[0] % max
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function PasswordTool() {
  const [length, setLength] = useState(16)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [customSymbols, setCustomSymbols] = useState('')
  const [excludeChars, setExcludeChars] = useState('')
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState([])
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [history, setHistory] = useLocalStorage('taotools-password-history', [])

  // 已选字符类型（原始字符集）
  const activeSets = useMemo(() => {
    const sets = []
    if (includeUpper) sets.push({ key: 'upper', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' })
    if (includeLower) sets.push({ key: 'lower', chars: 'abcdefghijklmnopqrstuvwxyz' })
    if (includeNumbers) sets.push({ key: 'numbers', chars: '0123456789' })
    if (includeSymbols) sets.push({ key: 'symbols', chars: customSymbols.trim() || DEFAULT_SYMBOLS })
    return sets
  }, [includeUpper, includeLower, includeNumbers, includeSymbols, customSymbols])

  // 经过「排除易混淆 / 排除指定字符」过滤后的可用字符集
  const validSets = useMemo(() => {
    return activeSets
      .map((s) => {
        let chars = s.chars
        if (excludeAmbiguous) {
          chars = [...chars].filter((c) => !AMBIGUOUS.includes(c)).join('')
        }
        if (excludeChars.trim()) {
          const ex = new Set(excludeChars.split(''))
          chars = [...chars].filter((c) => !ex.has(c)).join('')
        }
        return { ...s, chars: [...new Set(chars)].join('') }
      })
      .filter((s) => s.chars.length > 0)
  }, [activeSets, excludeAmbiguous, excludeChars])

  const charset = useMemo(() => {
    const all = validSets.map((s) => s.chars).join('')
    return [...new Set(all)].join('')
  }, [validSets])

  const generate = () => {
    if (activeSets.length === 0) {
      setError('请至少选择一种字符类型')
      setPasswords([])
      return []
    }
    if (charset.length === 0) {
      setError('过滤后没有可用字符，请调整排除选项')
      setPasswords([])
      return []
    }

    const list = []
    for (let k = 0; k < count; k++) {
      const pw = []
      if (length >= validSets.length) {
        // 保证每种已选类型至少出现一次
        validSets.forEach((s) => {
          pw.push(s.chars[randInt(s.chars.length)])
        })
        while (pw.length < length) {
          pw.push(charset[randInt(charset.length)])
        }
        shuffle(pw)
      } else {
        while (pw.length < length) {
          pw.push(charset[randInt(charset.length)])
        }
      }
      list.push(pw.join(''))
    }
    setPasswords(list)
    setError('')
    return list
  }

  // 显式点击「重新生成」时记录到历史（去重 + 最新在前）
  const handleGenerate = () => {
    const list = generate()
    if (list.length > 0) {
      setHistory((prev) => {
        const seen = new Set(prev)
        const fresh = list.filter((p) => !seen.has(p))
        return [...fresh, ...prev].slice(0, 30)
      })
    }
  }

  // 选项变化时自动重新生成
  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, customSymbols, excludeChars, count])

  const strength = useMemo(() => {
    if (charset.length === 0) return { bits: 0, score: 0, label: '—', color: 'bg-slate-300' }
    const bits = Math.round(length * Math.log2(charset.length))
    if (bits >= 100) return { bits, score: 4, label: '极强', color: 'bg-emerald-500' }
    if (bits >= 80) return { bits, score: 4, label: '强', color: 'bg-green-500' }
    if (bits >= 60) return { bits, score: 3, label: '较强', color: 'bg-yellow-500' }
    if (bits >= 40) return { bits, score: 2, label: '中等', color: 'bg-orange-500' }
    return { bits, score: 1, label: '弱', color: 'bg-red-500' }
  }, [length, charset])

  const copyOne = (pw, idx) => {
    navigator.clipboard.writeText(pw)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  const toggleClass =
    'flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'

  return (
    <div className="space-y-6">
      {/* 长度 */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">长度</label>
        <input
          type="range"
          min="4"
          max="128"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <input
          type="number"
          min="4"
          max="128"
          value={length}
          onChange={(e) => setLength(Math.max(4, Math.min(128, Number(e.target.value) || 4)))}
          className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 字符类型 */}
      <div className="grid grid-cols-2 gap-3">
        <label className={toggleClass}>
          <input type="checkbox" checked={includeUpper} onChange={(e) => setIncludeUpper(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">大写字母 (A-Z)</span>
        </label>
        <label className={toggleClass}>
          <input type="checkbox" checked={includeLower} onChange={(e) => setIncludeLower(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">小写字母 (a-z)</span>
        </label>
        <label className={toggleClass}>
          <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">数字 (0-9)</span>
        </label>
        <label className={toggleClass}>
          <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">特殊符号</span>
        </label>
      </div>

      <label className={`${toggleClass} w-fit`}>
        <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
        <span className="text-sm text-slate-700 dark:text-slate-300">排除易混淆字符 (0 O 1 l I |)</span>
      </label>

      {/* 自定义符号 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          自定义符号（勾选特殊符号后生效）
        </label>
        <input
          type="text"
          value={customSymbols}
          onChange={(e) => setCustomSymbols(e.target.value)}
          placeholder={DEFAULT_SYMBOLS}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 排除指定字符 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          排除指定字符
        </label>
        <input
          type="text"
          value={excludeChars}
          onChange={(e) => setExcludeChars(e.target.value)}
          placeholder="例如：abc123"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 生成数量 */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">生成数量</label>
        <input
          type="number"
          min="1"
          max="20"
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
          className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleGenerate} className="btn-primary text-sm py-2 px-6">
          <RefreshCw className="w-4 h-4 mr-2" />
          重新生成
        </button>
        {passwords.length > 0 && (
          <button onClick={copyAll} className="btn-secondary text-sm py-2 px-4">
            {copiedAll ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copiedAll ? '已复制' : '复制全部'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 强度 */}
      {passwords.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">密码强度：{strength.label}</span>
            <span className="text-xs text-slate-400">约 {strength.bits} bits 熵</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.score * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* 结果列表 */}
      {passwords.length > 0 && (
        <ul className="space-y-2">
          {passwords.map((pw, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <code className="font-mono text-base break-all text-slate-900 dark:text-white">{pw}</code>
              <button
                onClick={() => copyOne(pw, i)}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedIndex === i ? '已复制' : '复制'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 生成历史 */}
      {history.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <History className="w-4 h-4" /> 生成历史
            </span>
            <button
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空历史
            </button>
          </div>
          <ul className="space-y-1.5">
            {history.map((pw, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
              >
                <code className="font-mono text-xs break-all text-slate-600 dark:text-slate-300">{pw}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(pw)}
                  className="shrink-0 text-xs text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  复制
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}