import { useState } from 'react'

function base64UrlDecode(str) {
  if (!str) return ''
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const decoded = atob(b64 + pad)
  const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function formatClaim(h, p) {
  const helpers = []
  if (p) {
    if (p.exp) helpers.push(['过期时间 exp', new Date(p.exp * 1000).toLocaleString('zh-CN')])
    if (p.iat) helpers.push(['签发时间 iat', new Date(p.iat * 1000).toLocaleString('zh-CN')])
    if (p.nbf) helpers.push(['生效时间 nbf', new Date(p.nbf * 1000).toLocaleString('zh-CN')])
  }
  return helpers
}

export default function JwtTool() {
  const [input, setInput] = useState('')
  const [header, setHeader] = useState(null)
  const [payload, setPayload] = useState(null)
  const [claims, setClaims] = useState([])
  const [error, setError] = useState('')

  const decode = () => {
    setError('')
    setHeader(null)
    setPayload(null)
    setClaims([])

    const token = input.trim().replace(/^Bearer\s+/i, '')
    if (!token) {
      setError('请输入 JWT 字符串')
      return
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      setError('JWT 格式错误：应为 header.payload.signature 三段结构')
      return
    }

    try {
      const headerJson = JSON.parse(base64UrlDecode(parts[0]))
      const payloadJson = JSON.parse(base64UrlDecode(parts[1]))
      setHeader(headerJson)
      setPayload(payloadJson)
      setClaims(formatClaim(null, payloadJson))
    } catch (e) {
      setError('解码失败：' + e.message)
    }
  }

  const toPretty = (obj) => (obj ? JSON.stringify(obj, null, 2) : '')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          JWT 字符串
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="粘贴 JWT 字符串到此处..."
          className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <button onClick={decode} className="btn-primary text-sm py-2 px-4 mt-3">解码</button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {claims.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {claims.map(([label, value]) => (
            <span
              key={label}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              {label}：{value}
            </span>
          ))}
        </div>
      )}

      {header && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Header</label>
          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            {toPretty(header)}
          </pre>
        </div>
      )}

      {payload && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payload</label>
          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            {toPretty(payload)}
          </pre>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        提示：本工具仅解码（本地解析），不验证签名。请勿在不可信环境粘贴敏感令牌。
      </p>
    </div>
  )
}