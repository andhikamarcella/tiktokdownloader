import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255,255,255,0.08)',
        neon: '#7c3aed'
      },
      boxShadow: {
        neu: '10px 10px 30px rgba(0,0,0,0.35), -10px -10px 30px rgba(255,255,255,0.12)'
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulsefast: 'pulse 2s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-2px)' },
          '50%': { transform: 'translateY(4px)' }
        }
      }
    }
  },
  plugins: [],
}

export default config
