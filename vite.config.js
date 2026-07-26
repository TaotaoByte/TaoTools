import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-syntax-highlighter') || id.includes('node_modules/react-markdown')) {
            return 'markdown'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
