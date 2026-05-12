import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: '#0f172a',
          paper: '#f7f4ee',
          blue: '#244bff',
          cyan: '#7dd3fc',
          mint: '#86efac',
          sand: '#e7e1d8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
