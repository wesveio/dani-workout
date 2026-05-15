/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // New redesign tokens
        bg: 'var(--bg)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        line: 'var(--line)',
        txt: 'var(--txt)',
        'txt-dim': 'var(--txt-dim)',
        'txt-faint': 'var(--txt-faint)',
        lime: 'var(--lime)',
        amber: 'var(--amber)',
        red: 'var(--red)',

        // Legacy aliases — keep until shadcn primitives in src/components/ui/*
        // and any remaining consumers stop referencing them. Final cleanup
        // happens in Task 26.
        background: 'var(--bg)',
        foreground: 'var(--txt)',
        surface: 'var(--bg-1)',
        card: 'var(--bg-1)',
        accent: 'var(--lime)',
        muted: 'var(--txt-faint)',
        neutral: 'var(--line)',
      },
      borderRadius: {
        card: 'var(--r-card)',
        hero: 'var(--r-hero)',
        thumb: 'var(--r-thumb)',
      },
    },
  },
  plugins: [],
};
