import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        solar: {
          yellow: {
            50: '#fef7e8',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706'
          },
          blue: {
            400: '#60a5fa',
            500: '#3b82f6'
          }
        }
      },
      backgroundImage: {
        'gradient-solar': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #3b82f6 100%)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
