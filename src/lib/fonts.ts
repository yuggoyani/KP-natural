import localFont from "next/font/local";

/**
 * Arupala Grotesk custom font family definition
 * Includes all weights (100-900) and genuine italic styles for high-fidelity typography
 */
export const arupalaGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Air.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-AirItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SuperLt.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SuperLtIt.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-LightIta.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-MedIta.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SemBdIta.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-BoldIta.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SuperBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-SuperBdIt.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-Ultra.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/arupala-grotesk/ArupalaGroteskTrial-UltraIta.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-arupala",
  display: "swap",
});
