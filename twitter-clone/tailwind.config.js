module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // ou 'media' pour se baser sur les préférences système
  theme: {
    extend: {
      colors: {
        blue: {
          500: '#1DA1F2',
          600: '#1a91da',
        }
      },
    },
  },
  plugins: [],
} 