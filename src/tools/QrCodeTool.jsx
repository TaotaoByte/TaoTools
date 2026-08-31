import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'

const ecLevels = [
  { id: 'L', name: 'L（约 7%）' },
  { id: 'M', name: 'M（约 15%）' },
  { id: 'Q', name: 'Q（约 25%）' },
  { id: 'H', name: 'H（约 30%）' },
]

const sizeOptions = [
  { id: '256', name: '256 px' },
  { id: '384', name: '384 px' },
  { id: '512', name: '512 px' },
]

export default function QrCodeTool() {
  const [text, setText] = useState('')
  const [ecLevel, setEcLevel] = useState('M')
  const [size, setSize] = useState(256)
  const [margin, setMargin] = useState(4)
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState('')
  const [svgUrl, setSvgUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const t = text.trim()
    if (!t) {
      setDataUrl('')
      setSvgUrl('')
      setError('')
      return
    }
    let cancelled = false
    const opts = {
      errorCorrectionLevel: ecLevel,
      margin,
      color: { dark, light },
    }

    QRCode.toDataURL(t, { ...opts, width: size })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((e) => {
        if (!cancelled) setError('生成失败：' + e.message)
      })

    QRCode.toString(t, { ...opts, type: 'svg', width: size })
      .then((svg) => {
        if (!cancelled) setSvgUrl('data:image/svg+xml;utf8,' + encodeURIComponent(svg))
      })
      .catch((e) => {
        if (!cancelled) setError('生成失败：' + e.message)
      })

    return () => {
      cancelled = true
    }
  }, [text, ecLevel, size, margin, dark, light])

  const selectClass =
    'px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左侧：输入与选项 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            内容
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入文本、网址、WiFi 信息等..."
            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">纠错等级</label>
            <select value={ecLevel} onChange={(e) => setEcLevel(e.target.value)} className={`${selectClass} w-full`}>
              {ecLevels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">尺寸</label>
            <select value={String(size)} onChange={(e) => setSize(Number(e.target.value))} className={`${selectClass} w-full`}>
              {sizeOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">边距</label>
            <input
              type="number"
              min="0"
              max="16"
              value={margin}
              onChange={(e) => setMargin(Math.max(0, Math.min(16, Number(e.target.value) || 0)))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">前景色</label>
            <input
              type="color"
              value={dark}
              onChange={(e) => setDark(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">背景色</label>
            <input
              type="color"
              value={light}
              onChange={(e) => setLight(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 右侧：预览 */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-[280px] aspect-square rounded-xl border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center p-4">
          {dataUrl ? (
            <img src={dataUrl} alt="二维码" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-sm text-slate-400 dark:text-slate-500 px-4">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 opacity-50" />
              输入内容后自动生成二维码
            </div>
          )}
        </div>

        {dataUrl && (
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={dataUrl}
              download="qrcode.png"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" /> 下载 PNG
            </a>
            {svgUrl && (
              <a
                href={svgUrl}
                download="qrcode.svg"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" /> 下载 SVG
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}