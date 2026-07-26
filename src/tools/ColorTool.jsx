import { useState, useEffect } from 'react'

export default function ColorTool() {
  const [hex, setHex] = useState('#6366f1')
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 })
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 })

  // HEX 转 RGB
  const hexToRgb = (h) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // RGB 转 HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // RGB 转 HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // HSL 转 RGB
  const hslToRgb = (h, s, l) => {
    h /= 360; s /= 100; l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  useEffect(() => {
    const newRgb = hexToRgb(hex)
    if (newRgb) {
      setRgb(newRgb)
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
    }
  }, [hex])

  const handleRgbChange = (key, value) => {
    const newRgb = { ...rgb, [key]: Math.max(0, Math.min(255, parseInt(value) || 0)) }
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  const handleHslChange = (key, value) => {
    const newHsl = { ...hsl, [key]: Math.max(0, Math.min(360, parseInt(value) || 0)) }
    if (key !== 'h') {
      newHsl[key] = Math.max(0, Math.min(100, parseInt(value) || 0))
    }
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  const copyValue = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div
        className="w-full h-32 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors"
        style={{ backgroundColor: hex }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">HEX</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
            />
            <button onClick={() => copyValue(hex)} className="btn-secondary text-sm py-2 px-3">复制</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">RGB</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={rgb.r}
              onChange={(e) => handleRgbChange('r', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={rgb.g}
              onChange={(e) => handleRgbChange('g', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={rgb.b}
              onChange={(e) => handleRgbChange('b', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button onClick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="btn-secondary text-sm py-2 px-3">复制</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">HSL</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={hsl.h}
              onChange={(e) => handleHslChange('h', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={hsl.s}
              onChange={(e) => handleHslChange('s', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={hsl.l}
              onChange={(e) => handleHslChange('l', e.target.value)}
              className="w-16 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="btn-secondary text-sm py-2 px-3">复制</button>
          </div>
        </div>
      </div>
    </div>
  )
}
