import { useEffect, useRef, useState } from 'react'

export default function ImageCompressTool() {
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [format, setFormat] = useState('image/webp')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  useEffect(() => () => { generation.current++ }, [])
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])
  const reset = () => { generation.current++; setBusy(false); setResult(null); setError('') }
  const compress = async () => {
    const id = ++generation.current
    setBusy(true); setError(''); setResult(null)
    let bitmap
    try {
      if (!file || file.size > 30 * 1024 * 1024) throw new Error('请选择 30 MB 以内的 JPG、PNG 或 WebP 图片。')
      if (!Number.isInteger(maxWidth) || maxWidth < 1 || maxWidth > 8192) throw new Error('最大边长请填写 1–8192 之间的整数。')
      bitmap = await createImageBitmap(file)
      if (bitmap.width * bitmap.height > 40000000) throw new Error('图片像素过大，请选择 4000 万像素以内的图片。')
      const ratio = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('浏览器暂不支持图片处理。')
      if (format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality / 100))
      if (!blob) throw new Error('图片处理失败，请换一张图片。')
      if (generation.current !== id) return
      const extension = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png'
      setResult({ url: URL.createObjectURL(blob), size: blob.size, width: canvas.width, height: canvas.height, name: `${file.name.replace(/\.[^.]+$/, '')}-compressed.${extension}` })
    } catch (e) { if (generation.current === id) setError(e.message) }
    finally { bitmap?.close(); if (generation.current === id) setBusy(false) }
  }
  const field = 'rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-sm'
  return <div className="space-y-6">
    <p className="text-sm text-slate-500">图片在你的设备上处理，不上传服务器。JPEG 会将透明区域填为白色；动画图片仅导出首帧。</p>
    <label className="block border border-dashed border-primary-300 rounded-xl p-8 bg-primary-50 dark:bg-slate-800 text-sm">选择图片（JPG / PNG / WebP，最多 30 MB）<input aria-label="选择图片" className="block mt-4 max-w-full" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { reset(); setFile(e.target.files?.[0] || null) }} />{file && <span className="block mt-3 break-all">{file.name} · {(file.size / 1024).toFixed(1)} KB</span>}</label>
    <div className="grid sm:grid-cols-3 gap-5">
      <label className="text-sm space-y-2">输出格式<select className={`${field} block w-full`} value={format} onChange={e => { reset(); setFormat(e.target.value) }}><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option></select></label>
      <label className="text-sm space-y-2">最大边长（像素）<input className={`${field} block w-full`} type="number" min="1" max="8192" value={maxWidth} onChange={e => { reset(); setMaxWidth(Number(e.target.value)) }} /></label>
      <label className="text-sm space-y-2">质量 {quality}%<input className="block w-full mt-5 accent-primary-600" type="range" min="10" max="100" value={quality} onChange={e => { reset(); setQuality(Number(e.target.value)) }} /></label>
    </div>
    <button className="btn-primary disabled:opacity-50" disabled={!file || busy} onClick={compress}>{busy ? '正在处理…' : '压缩图片'}</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {result && <div className="space-y-4" aria-live="polite"><p className="text-sm">{result.width} × {result.height} · {(result.size / 1024).toFixed(1)} KB · {result.size < file.size ? `体积减少 ${(100 - result.size / file.size * 100).toFixed(1)}%` : '原图已较小，输出体积未减少，可尝试降低质量'}</p><img className="max-h-72 rounded-lg border border-slate-200 object-contain" src={result.url} alt="压缩后的图片预览" /><a className="btn-secondary" href={result.url} download={result.name}>下载图片</a></div>}
  </div>
}
