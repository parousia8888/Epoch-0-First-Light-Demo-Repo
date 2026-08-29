// ============================================================
// demos/chintai/theme.ts — 找房初期费用拆解器的视觉人格
// 档位:rough。房产传单风:白底、4px 粗黑边框、荧光黄高亮、红色大字。
// 【纪律】传单本来就丑,丑得理直气壮——不要顺手打磨,不要加动效。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-white text-black",
  font: "font-sans",
  /** 传单红:特価チラシ的那种红 */
  accent: "#dd0000",
  /** 荧光黄:高亮块 / 可谈判定 */
  highlight: "#ffff00",
  bpVars: {
    "--bp-bg": "#ffffff",
    "--bp-fg": "#111111",
    "--bp-accent": "#dd0000"
  } as CSSProperties
};
