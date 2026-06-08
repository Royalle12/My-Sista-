/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── My Sista Brand Palette — Forest Green + Cream + Blush ──────────
        // Extracted directly from logo (src/assets/logo-full.png)
        primary: {
          DEFAULT: '#4A5342',   // Deep forest green — headings, CTAs, nav
          light:   '#52584A',   // Lighter forest green — secondary text
          50:      '#F0F0E8',   // Same as cream — lightest tint
          100:     '#E0E2DA',
          200:     '#C1C5BB',
          300:     '#A2A89B',
          400:     '#838B7C',
          500:     '#4A5342',
          600:     '#3D4537',
          700:     '#30372B',
          800:     '#232920',
          900:     '#161B14',
          dark:    '#2C3228',   // Deep green-black — body text
        },
        secondary: {
          DEFAULT: '#F8E0DD',   // Blush pink — brush stroke, accents, tags
          deep:    '#F0D2D2',   // Deeper blush — hover states, borders
          100:     '#FEF8F7',
          200:     '#F8E0DD',
          300:     '#F0D2D2',
          400:     '#E8C0BC',
          500:     '#DFA8A3',
        },
        cream:   '#F0F0E8',     // Warm cream — primary page background
        surface: '#FAFAF5',     // Near-white cream — card backgrounds
        dark:    '#2C3228',     // Deep green-black — body text
        mid:     '#7A8070',     // Muted sage — secondary/placeholder text
      },

      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        // Green-toned shadows
        soft: '0 2px 16px 0 rgba(74, 83, 66, 0.08)',
        card: '0 4px 24px 0 rgba(74, 83, 66, 0.12)',
        glow: '0 0 32px 0 rgba(74, 83, 66, 0.20)',
        // Blush lift — for hover on blush-coloured elements
        blush: '0 4px 20px 0 rgba(248, 224, 221, 0.60)',
      },

      backgroundImage: {
        // Forest green gradient — used for primary buttons, logo mark, badges
        'gradient-brand':
          'linear-gradient(135deg, #4A5342 0%, #2C3228 100%)',
        // Cream to blush — used for page backgrounds, hero sections
        'gradient-soft':
          'linear-gradient(135deg, #F0F0E8 0%, #F8E0DD 100%)',
        // Deep green — used for dark sections, footer
        'gradient-dark':
          'linear-gradient(135deg, #2C3228 0%, #4A5342 100%)',
        // Subtle cream — inner card gradients
        'gradient-cream':
          'linear-gradient(135deg, #FAFAF5 0%, #F0F0E8 100%)',
      },

      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
