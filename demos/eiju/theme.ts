// ============================================================
// demos/eiju/theme.ts — 永住点数计算器的视觉人格
// 档位:rough。答题卡/表格风,黑蓝双色,像 Excel 直接糊上网页。
// 【纪律】糙即风格,不要顺手打磨,不要加动效。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-[#f4f4f0] text-black",
  font: "font-sans",
  /** Excel 蓝 */
  accent: "#1a56c4",
  bpVars: {
    "--bp-bg": "#ffffff",
    "--bp-fg": "#111111",
    "--bp-accent": "#1a56c4"
  } as CSSProperties
};
