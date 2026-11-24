/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1C1C1E",
          50: "#F4F4F5",
          100: "#E3E3E6",
          200: "#C4C4C9",
          300: "#9F9FA6",
          400: "#6E6E77",
          500: "#2C2C34", // secondary dark surface
          600: "#1C1C1E", // primary
          700: "#17171A",
          800: "#131314",
          900: "#0D0D0E",
          950: "#08080A"
        },
        gold: {
          DEFAULT: "#C9A227",
          50: "#FBF7E9",
          100: "#F7EED4",
          200: "#EEDDAA",
          300: "#E4CA76",
          400: "#DCB94C",
          500: "#C9A227",
          600: "#AB8A21",
          700: "#826919",
          800: "#6D5815",
          900: "#4B3C0F"
        },
        ink: "#1A1E27",       // near-black body text on light backgrounds
        paper: "#FAF8F3",     // matches prototype's ivory
        charcoal: {
          DEFAULT: "#0F0F10",
          50: "#F2F2F2",
          100: "#DADADA",
          200: "#B5B5B6",
          700: "#1A1A1B",
          800: "#0F0F10",
          900: "#0A0A0B"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.24), 0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-lg": "0 2px 4px rgba(0, 0, 0, 0.28), 0 12px 32px rgba(0, 0, 0, 0.12)",
        gold: "0 4px 20px rgba(201, 162, 39, 0.18)"
      },
      fontFamily: {
        display: ["'EB Garamond'", "Georgia", "serif"],
        sans: ["Lato", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      },
      fontSize: {
        base: ["1.125rem", { lineHeight: "1.75" }],   // 18px
        lg: ["1.25rem", { lineHeight: "1.75" }],       // 20px
        xl: ["1.4rem", { lineHeight: "1.6" }],         // ~22px
        "2xl": ["1.75rem", { lineHeight: "1.4" }],     // 28px
        "3xl": ["2.1rem", { lineHeight: "1.3" }],      // ~34px
        "4xl": ["2.6rem", { lineHeight: "1.2" }],      // ~42px
        "5xl": ["3.2rem", { lineHeight: "1.15" }]      // ~51px
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },
      minHeight: {
        touch: "44px"
      },
      minWidth: {
        touch: "44px"
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms"
      },
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)"
      }
    }
  },
  plugins: [require("@tailwindcss/container-queries")]
};
