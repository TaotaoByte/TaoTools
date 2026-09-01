import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`读取 localStorage 失败: ${key}`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`写入 localStorage 失败: ${key}`, error)
    }
  }, [key, storedValue])

  // 跨标签页同步：其它标签修改同一 key 时，同步到当前页面，
  // 避免旧页面内存里仍残留旧的 apiKey / model 继续发请求
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue == null) return
      try {
        setStoredValue(JSON.parse(e.newValue))
      } catch (error) {
        console.error(`同步 localStorage 失败: ${key}`, error)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [storedValue, setStoredValue]
}
