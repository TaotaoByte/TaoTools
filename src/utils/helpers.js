// 通用工具函数
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

/**
 * 合并 className。
 * 用 tailwind-merge 而不是简单拼接：这样调用方传的类名能真正覆盖组件内置的类名
 * （例如给 <Card className="bg-transparent" /> 时不会被内置的 bg-white 顶掉）。
 */
export function cn(...classes) {
  return twMerge(clsx(classes))
}

export function formatNumber(num) {
  return num.toLocaleString('zh-CN')
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}
