/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "on-secondary-fixed-variant": "#3f465c",
              "tertiary-fixed-dim": "#d0bcff",
              "on-background": "#191c1e",
              "inverse-primary": "#ffb3b6",
              "surface-container-low": "#f2f4f6",
              "secondary-container": "#dae2fd",
              "surface": "#f7f9fb",
              "on-error": "#ffffff",
              "tertiary-container": "#8354ee",
              "background": "#f7f9fb",
              "surface-container-high": "#e6e8ea",
              "on-tertiary-container": "#fffafd",
              "on-secondary": "#ffffff",
              "secondary-fixed": "#dae2fd",
              "surface-dim": "#d8dadc",
              "surface-variant": "#e0e3e5",
              "surface-container-lowest": "#ffffff",
              "primary-fixed": "#ffdada",
              "surface-container-highest": "#e0e3e5",
              "on-tertiary-fixed-variant": "#5516be",
              "on-secondary-fixed": "#131b2e",
              "on-primary-fixed-variant": "#920028",
              "surface-tint": "#be0037",
              "on-error-container": "#93000a",
              "on-tertiary-fixed": "#23005c",
              "tertiary-fixed": "#e9ddff",
              "secondary": "#565e74",
              "primary-fixed-dim": "#ffb3b6",
              "on-primary-container": "#fffaf9",
              "on-primary": "#ffffff",
              "error": "#ba1a1a",
              "tertiary": "#6a37d3",
              "on-surface-variant": "#5c3f40",
              "outline-variant": "#e5bdbe",
              "surface-bright": "#f7f9fb",
              "on-surface": "#191c1e",
              "surface-container": "#eceef0",
              "inverse-surface": "#2d3133",
              "primary-container": "#e11d48",
              "on-secondary-container": "#5c647a",
              "outline": "#906f70",
              "primary": "#b80035",
              "on-tertiary": "#ffffff",
              "secondary-fixed-dim": "#bec6e0",
              "on-primary-fixed": "#40000c",
              "inverse-on-surface": "#eff1f3",
              "error-container": "#ffdad6"
          },
          "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
          },
          "spacing": {
              "margin-mobile": "16px",
              "gutter": "24px",
              "container-max": "1280px",
              "section-gap": "64px",
              "base": "8px"
          },
          "fontFamily": {
              "label-bold": ["Work Sans", "sans-serif"],
              "body-lg": ["Work Sans", "sans-serif"],
              "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
              "body-sm": ["Work Sans", "sans-serif"],
              "body-md": ["Work Sans", "sans-serif"],
              "headline-md": ["Plus Jakarta Sans", "sans-serif"],
              "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
              "price-lg": ["Plus Jakarta Sans", "sans-serif"]
          },
          "fontSize": {
              "label-bold": ["12px", {"letterSpacing": "0.05em", "fontWeight": "600"}],
              "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "headline-xl": ["40px", {"lineHeight": "1.2", "fontWeight": "700"}],
              "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
              "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
              "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
              "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
              "price-lg": ["20px", {"lineHeight": "1", "fontWeight": "700"}]
          }
      }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
