/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Trust-blue: the calm, reliable system voice
        trust: {
          50: "#EEF3F8",
          100: "#D6E2ED",
          200: "#C4D1E0",
          300: "#7FA0BC",
          400: "#5A7BA8",
          500: "#2D4E6E",
          600: "#234A6D",
          700: "#1B334A",
          800: "#142641",
          900: "#0F1F2E",
        },
        // Hazard-amber: urgency / alert accent, echoes roadside safety colour
        hazard: {
          50: "#FFF6E5",
          100: "#FFE6B3",
          200: "#FFDF9E",
          300: "#FDD789",
          400: "#F5A623",
          500: "#E08E00",
          600: "#D17F00",
          700: "#8A5600",
        },
        // Status workflow colours
        status: {
          reported: "#8A93A6",
          assigned: "#2D4E6E",
          accepted: "#0E7C86",
          progress: "#E08E00",
          completed: "#1E7A46",
          cancelled: "#B23A3A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        heading: ["'Space Grotesk'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
