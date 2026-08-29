// ============================================================
// demos/roulette/theme.ts — 赤坂午饭轮盘的视觉人格
// 档位:gsap。俗艳霓虹:近黑紫底 + 霓虹粉/青/黄,老虎机金属开窗。
// 【纪律】霓虹只做点缀(glow 集中在标题/滚轮/结果卡),排版保持干净。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-[#120a1e] text-[#f3ecff]",
  font: "font-sans",
  /** 霓虹粉(主强调) */
  accent: "#ff2d95",
  /** 霓虹青(次强调) */
  cyan: "#2ee6ff",
  /** 霓虹黄(中奖/数字) */
  gold: "#ffd93b",
  /** 面板底(比页面底浅一档的紫黑) */
  panel: "#1c1030",
  /** 多层 text-shadow 的 neon glow(粉) */
  glowPink: "0 0 4px rgba(255,45,149,0.9), 0 0 12px rgba(255,45,149,0.6), 0 0 28px rgba(255,45,149,0.35)",
  /** 多层 text-shadow 的 neon glow(青) */
  glowCyan: "0 0 4px rgba(46,230,255,0.9), 0 0 12px rgba(46,230,255,0.55), 0 0 26px rgba(46,230,255,0.3)",
  bpVars: {
    "--bp-bg": "#1c1030",
    "--bp-fg": "#f3ecff",
    "--bp-accent": "#ff2d95"
  } as CSSProperties
};
