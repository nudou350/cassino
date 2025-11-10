/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Casino-themed color palette
        casino: {
          primary: '#FF6B35',      // Vibrant orange
          secondary: '#004E89',    // Deep blue
          accent: '#F7B801',       // Gold
          success: '#06A77D',      // Green
          danger: '#D62828',       // Red
          dark: '#1A1A2E',         // Dark background
          darker: '#0F0F1E',       // Darker background
          light: '#EAEAEA',        // Light gray
        },
        // Game-specific colors
        slot: {
          cherry: '#D62828',
          lemon: '#F7B801',
          orange: '#FF6B35',
          grape: '#6A4C93',
          watermelon: '#FF4365',
          seven: '#FFD700',
          bar: '#1A1A2E',
        },
        // Card suits
        card: {
          heart: '#D62828',
          diamond: '#D62828',
          club: '#1A1A2E',
          spade: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 107, 53, 0.5)',
        'neon-gold': '0 0 20px rgba(247, 184, 1, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 78, 137, 0.5)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'game': '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}

