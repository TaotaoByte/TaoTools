// 通用工具函数

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatNumber(num) {
  return num.toLocaleString('zh-CN')
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}
