import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Tertiary text. Replaces zinc-500/600 for text, which measured
        // 3.7:1 and 2.3:1 on panels — below WCAG AA (4.5:1) for small text.
        // #909099 is 5.6:1 on panels, 6.3:1 on the page, 4.7:1 on zinc-800.
        // tests/contrast.test.ts keeps it (and the class usage) honest.
        muted: "#909099",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
