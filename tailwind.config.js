/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#DDDCDB',
        foreground: '#080807',
        muted: '#90908F',
        accent: '#18D02E',
        neutral: '#454132',
        card: '#F2F1EF',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '24px',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
