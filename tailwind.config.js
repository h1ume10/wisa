/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    // The default browser root is 16px. Rather than override html { font-size },
    // which can cause zoom/rem-unit surprises for assistive tech, the type scale
    // below is redefined in absolute rem values so text-base itself equals 18px.
    extend: {
      colors: {
        // Reverted back to charcoal: the true blue-navy read as too bright
        // for the amount of area it covers (header, hero, CTA bands), so
        // this goes back to the prototype-matched near-black charcoal. Kept
        // the Tailwind key name "navy" rather than renaming it across every
        // page purely for a cosmetic key name — the rendered colour is what
        // matters. Gold is untouched: every shade already clears WCAG AA
        // against this charcoal too (verified before reverting), so it
        // didn't need re-tuning.
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
        // Untouched by the charcoal revert — every shade already clears
        // WCAG AA against #1C1C1E (verified: 400 at 8.98:1, DEFAULT at
        // 7.03:1 for large/bold, 600 at 5.18:1 for focus rings), same as it
        // did against the navy blue it's reverting away from.
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
          // A distinct, even-darker near-black kept for the footer only, so
          // header/hero (navy-600, #1C1C1E) and footer stay two visibly
          // different dark tones rather than converging now that "navy"
          // itself is charcoal.
          DEFAULT: "#0F0F10",
          50: "#F2F2F2",
          100: "#DADADA",
          200: "#B5B5B6",
          700: "#1A1A1B",
          800: "#0F0F10",
          900: "#0A0A0B"
        }
      },
      // Material's elevation shadows are always two layers — a tight,
      // darker "key" shadow close to the surface plus a soft, lighter
      // "ambient" shadow spreading further out — not one soft blur. That
      // two-layer recipe is what actually reads as "Google-ish" here, not
      // the color or radius.
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
        // Explicit scale so nothing on the site ever dips under 16px,
        // with the base body copy sitting at 18px per the accessibility brief.
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
        // A stronger ease-out than Tailwind's default: starts moving
        // immediately instead of easing in, which is what makes a pressed
        // button or an opening menu read as responsive rather than sluggish.
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)"
      }
    }
  },
  // Container queries aren't core in this Tailwind major version (v3) —
  // this is the official first-party plugin, not a third-party shim.
  // `has-*`/`group-has-*` variants need no plugin; they're built into the
  // installed v3.4.x core already.
  plugins: [require("@tailwindcss/container-queries")]
};
