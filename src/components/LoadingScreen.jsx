import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white text-2xl font-bold">T</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
            <span className="text-slate-600 dark:text-slate-400 font-medium">TaoTools</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
