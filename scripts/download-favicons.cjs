const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const publicDir = path.join(__dirname, '..', 'public')
const faviconsDir = path.join(publicDir, 'favicons')

if (!fs.existsSync(faviconsDir)) {
  fs.mkdirSync(faviconsDir, { recursive: true })
}

const tools = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'tools.json'), 'utf-8'))
const resources = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'resources.json'), 'utf-8'))
const software = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'software.json'), 'utf-8'))

const items = [
  ...tools.items.filter((i) => i.type === 'external'),
  ...resources.items,
  ...software.items,
]

function fetch(url, binary = true) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        },
        timeout: 15000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetch(new URL(res.headers.location, url).toString(), binary).then(resolve).catch(reject)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`status ${res.statusCode}`))
          return
        }
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          resolve(binary ? buf : buf.toString('utf-8'))
        })
      },
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

function extractIconUrl(html, baseUrl) {
  // Match <link rel="icon" href="..."> or rel="shortcut icon"
  const match = html.match(/<link[^>]+rel=["']?(?:shortcut\s+)?icon["']?[^>]*>/i)
  if (!match) return null
  const hrefMatch = match[0].match(/href=["']([^"']+)["']/i)
  if (!hrefMatch) return null
  return new URL(hrefMatch[1], baseUrl).toString()
}

async function downloadFavicon(item) {
  const { id, url } = item
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    console.log(`⏭️ 跳过 ${id}: URL 无效`)
    return
  }

  const destPath = path.join(faviconsDir, `${id}.ico`)
  if (fs.existsSync(destPath)) {
    console.log(`✅ ${id}: 已存在`)
    return
  }

  const candidates = [
    `${parsed.origin}/favicon.ico`,
    `${parsed.origin}/favicon.png`,
    `${parsed.origin}/apple-touch-icon.png`,
    `${parsed.origin}/images/favicon.ico`,
    `${parsed.origin}/front-static/favicon.ico`,
  ]

  for (const candidate of candidates) {
    try {
      const data = await fetch(candidate)
      if (data.length < 50) {
        console.log(`⏭️ ${id}: ${candidate} 内容太小 (${data.length} bytes)`)
        continue
      }
      fs.writeFileSync(destPath, data)
      console.log(`✅ ${id}: 已下载 ${candidate} (${data.length} bytes)`)
      return
    } catch (err) {
      console.log(`⏭️ ${id}: ${candidate} 失败 (${err.message})`)
    }
  }

  // Try parsing HTML for icon link
  try {
    const html = await fetch(url, false)
    const iconUrl = extractIconUrl(html, url)
    if (iconUrl) {
      const data = await fetch(iconUrl)
      if (data.length >= 50) {
        fs.writeFileSync(destPath, data)
        console.log(`✅ ${id}: 已解析下载 ${iconUrl} (${data.length} bytes)`)
        return
      }
    }
  } catch (err) {
    console.log(`⏭️ ${id}: 解析 HTML 失败 (${err.message})`)
  }

  console.log(`❌ ${id}: 未找到 favicon`)
}

async function main() {
  for (const item of items) {
    await downloadFavicon(item)
  }
  console.log('\n全部完成')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
