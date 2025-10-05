/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mobilet-blue': '#1E40AF',
        'mobilet-light-blue': '#3B82F6',
        'mobilet-dark-blue': '#1E3A8A',
        'mobilet-gray': '#6B7280',
        'mobilet-green': '#10B981',
        'mobilet-yellow': '#F59E0B',
        'mobilet-red': '#EF4444',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
