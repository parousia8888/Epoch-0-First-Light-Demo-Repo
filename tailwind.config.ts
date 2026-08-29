// Tailwind 配置。
// 每个 demo 的"视觉人格"不在这里定义,而在各自的 demos/<slug>/theme.ts 里。
// 这里只登记内容扫描路径和五个 Google 字体的 CSS 变量。
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./core/**/*.{ts,tsx}", "./demos/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mincho: ["var(--font-shippori)", "serif"],
        dot: ["var(--font-dotgothic)", "monospace"],
        typewriter: ["var(--font-courier)", "monospace"],
        hand: ["var(--font-yomogi)", "cursive"],
        sans: ["var(--font-noto)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
