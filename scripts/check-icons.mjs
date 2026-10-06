import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const m = fs.readFileSync(path.join(ROOT, 'node_modules/lucide-react/dist/esm/lucide-react.mjs'), 'utf8')
const exported = new Set([...m.matchAll(/as ([A-Za-z0-9_]+)/g)].map((x) => x[1]))

const dataDir = path.join(ROOT, 'src', 'data')
const bad = new Map()
let checked = 0

function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) {
      scan(p)
      continue
    }
    if (!/\.(json|js|jsx)$/.test(f.name) || f.name === 'searchIndex.js') continue
    const txt = fs.readFileSync(p, 'utf8')
    for (const mm of txt.matchAll(/"icon"\s*:\s*"([^"]+)"/g)) {
      checked++
      const name = mm[1]
      if (!exported.has(name)) {
        if (!bad.has(name)) bad.set(name, new Set())
        bad.get(name).add(path.relative(ROOT, p))
      }
    }
  }
}
scan(dataDir)

console.log(`检查了 ${checked} 处 "icon" 字段`)
if (!bad.size) {
  console.log('✅ 全部图标名在 lucide-react 中都存在')
} else {
  console.log('❌ 以下图标名不存在（运行时会退化成 HelpCircle 问号）：')
  for (const [name, files] of bad) console.log(`   ${name}  ← ${[...files].join(', ')}`)
  process.exitCode = 1
}
