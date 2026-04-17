import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1020",
        accent: "#625DF5",
        accentSoft: "#EEF0FF",
        success: "#0EA56B",
        borderSoft: "rgba(15, 23, 42, 0.08)"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(98, 93, 245, 0.18)",
        soft: "0 12px 48px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(98,93,245,0.18), transparent 42%), radial-gradient(circle at bottom right, rgba(14,165,107,0.16), transparent 24%)"
      }
    }
  },
  plugins: []
};

export default config;
