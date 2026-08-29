// ============================================================
// demos/nomikai/theme.ts — 饮み会遁走器 🏮 的视觉人格
// 档位:gsap。昭和居酒屋:深夜暖色、暗棕底、暖黄灯光、灯笼红。
// 字体用手写体 Yomogi(font-hand),动效在 page 里用 GSAP 做。
// 【纪律】简约现代的居酒屋,不堆素材;灯光感靠配色而不是贴图。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  /** 深夜的店内:接近黑的暖棕 */
  page: "bg-[#1c110b] text-[#f3e3c2]",
  font: "font-hand",
  /** 暖黄灯光(强调色) */
  accent: "#f0b24a",
  /** 灯笼红 */
  lantern: "#d4483e",
  /** 被灯光烘过的卡片深棕 */
  card: "#2a1a10",
  /** 卡片描边:暖黄的极淡版本 */
  border: "rgba(240,178,74,0.28)",
  bpVars: {
    "--bp-bg": "#241610",
    "--bp-fg": "#f3e3c2",
    "--bp-accent": "#f0b24a"
  } as CSSProperties
};
