/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#161616',
        foreground: '#F7F7F5',
        surface: '#1F1F1F',
        muted: '#CECECE',
        accent: '#4EFF74',
        accentSecondary: '#4495FF',
        neutral: '#2C2C2C',
        card: '#1F1F1F',
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
