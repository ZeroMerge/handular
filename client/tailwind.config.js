/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cloudflare: {
          blue: '#0051c3',
          hover: '#0043a8',
          subtle: '#eaf2fd',
          orange: '#f38020',
        },
      },
      borderRadius: {
        '2xl': '16px',
        xl: '12px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};
