/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        foreground: '#F5F5F3',
        surface: '#1A1A1A',
        muted: '#888888',
        accent: '#FF3D3D',
        accentSecondary: '#FF8C00',
        neutral: '#2A2A2A',
        card: '#1A1A1A',
        destructive: '#EF4444',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '24px',
      },
      boxShadow: {
        soft: '0 15px 40px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
