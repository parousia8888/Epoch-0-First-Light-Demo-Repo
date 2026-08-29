// ============================================================
// demos/yakusho/theme.ts — 市役所文件解读器的视觉人格
// 档位:standard。役所公文风:公文白底 + 墨黑 + 印章朱红点缀,
// 等线体(Noto Sans JP)、横线表格感,像一张干净的行政表格。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-[#f7f6f2] text-[#1a1a1a]",
  font: "font-sans",
  /** 印章朱红(朱肉色) */
  accent: "#ba2636",
  /** 墨黑 */
  ink: "#1a1a1a",
  bpVars: {
    "--bp-bg": "#ffffff",
    "--bp-fg": "#1a1a1a",
    "--bp-accent": "#ba2636"
  } as CSSProperties
};
