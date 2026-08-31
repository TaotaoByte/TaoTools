import { useState, useEffect } from 'react'

function Channel({ label, value, min, max, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  )
}

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

  const validHex = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'

  return (
    <div className="space-y-6">
      {/* 预览 + 色盘 */}
      <div className="flex items-stretch gap-4">
        <div
          className="flex-1 h-28 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors"
          style={{ backgroundColor: validHex }}
        />
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <input
            type="color"
            value={validHex}
            onChange={(e) => setHex(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
            aria-label="色盘"
          />
          <span className="text-xs text-slate-400 dark:text-slate-500">色盘</span>
        </div>
      </div>

      {/* HEX */}
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

      {/* RGB */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">RGB</label>
          <button onClick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
            复制 rgb({rgb.r}, {rgb.g}, {rgb.b})
          </button>
        </div>
        <div className="space-y-2.5">
          <Channel label="R" value={rgb.r} min={0} max={255} onChange={(v) => handleRgbChange('r', v)} />
          <Channel label="G" value={rgb.g} min={0} max={255} onChange={(v) => handleRgbChange('g', v)} />
          <Channel label="B" value={rgb.b} min={0} max={255} onChange={(v) => handleRgbChange('b', v)} />
        </div>
      </div>

      {/* HSL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">HSL</label>
          <button onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
            复制 hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
          </button>
        </div>
        <div className="space-y-2.5">
          <Channel label="H" value={hsl.h} min={0} max={360} onChange={(v) => handleHslChange('h', v)} />
          <Channel label="S" value={hsl.s} min={0} max={100} onChange={(v) => handleHslChange('s', v)} />
          <Channel label="L" value={hsl.l} min={0} max={100} onChange={(v) => handleHslChange('l', v)} />
        </div>
      </div>
    </div>
  )
}