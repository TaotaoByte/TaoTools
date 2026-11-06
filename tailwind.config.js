/** @type {import('tailwindcss').Config} */

// 说明：本站刻意不使用「紫蓝渐变 + 玻璃拟态」那套模板化视觉。
// 颜色取向为明亮纸白、暖灰和植物绿。
// 为了让既有页面一次性统一到暖色中性系，这里把 slate 重新映射为暖灰阶（等同 Tailwind stone）。
const ink = {
  50: '#fafbf7',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
  950: '#0c0a09',
}

// 植物绿，用于交互与强调
const cinnabar = {
  50: '#f0f5ef', 100: '#e1eddf', 200: '#c6dcc6', 300: '#a1c4a6',
  400: '#7ca987', 500: '#558766', 600: '#38664b', 700: '#2d533e',
  800: '#284334', 900: '#24392e', 950: '#111f18',
}

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 只用系统字体：不再依赖 Google Fonts（国内访问会被墙，导致字体闪烁与布局跳动）
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Source Han Sans SC"',
          '"Noto Sans CJK SC"',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"JetBrains Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        // 暖色中性阶（覆盖默认偏冷的 slate）
        slate: ink,
        primary: cinnabar,
      },
      // 收敛圆角：默认的 16/24px 大圆角是「AI 模板」最明显的特征之一
      borderRadius: {
        sm: '3px',
        DEFAULT: '5px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '14px',
      },
      // 阴影收紧、去掉大范围彩色投影
      boxShadow: {
        sm: '0 1px 2px 0 rgb(28 25 23 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(28 25 23 / 0.07), 0 1px 2px -1px rgb(28 25 23 / 0.05)',
        md: '0 2px 6px -1px rgb(28 25 23 / 0.08), 0 1px 2px -1px rgb(28 25 23 / 0.05)',
        lg: '0 4px 12px -2px rgb(28 25 23 / 0.09)',
        xl: '0 8px 20px -5px rgb(28 25 23 / 0.11)',
        '2xl': '0 12px 28px -8px rgb(28 25 23 / 0.13)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'fade-in-up': 'fadeInUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
