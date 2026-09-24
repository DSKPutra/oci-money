/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0B0D',
        panel: '#121317',
        border: '#22242A',
        neon: '#00E599',
        purple: '#7C5CFF',
        light: {
          bg: '#F7F8FA',
          panel: '#FFFFFF',
          border: '#E4E6EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
