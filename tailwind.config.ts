import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: "#0F5E3D",
            50: "#EDF7F2",
            100: "#D6ECE1",
            200: "#AEDBCA",
            300: "#7EC5AD",
            400: "#4FAC8D",
            500: "#27916E",
            600: "#1A7654",
            700: "#0F5E3D", // Primary Brand Color
            800: "#0B472E",
            900: "#073220",
            950: "#031E12",
          },
          ivory: {
            DEFAULT: "#FAF6ED", // Main Background
            50: "#FFFFFF",
            100: "#FCFAF4",
            200: "#FAF6ED",
            300: "#F4EFE6",
            400: "#ECE5D8",
            500: "#E2D9C8",
            600: "#D5C9B3",
          },
          border: {
            light: "#EAE3D2",
            DEFAULT: "#DFD6C2",
            dark: "#C8BD9F",
          },
          gold: {
            DEFAULT: "#C99738",
            light: "#E0B359",
            dark: "#A67A26",
          },
          text: {
            primary: "#14291E",
            secondary: "#485C50",
            muted: "#73867A",
            light: "#FAF6ED",
          }
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(15, 94, 61, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 12px 32px -8px rgba(15, 94, 61, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 40px -12px rgba(15, 94, 61, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'farm': '12px',
        'farm-lg': '16px',
        'farm-xl': '24px',
      }
    },
  },
  plugins: [],
};
export default config;
