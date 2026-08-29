// ============================================================
// demos/postmortem/theme.ts — 个人项目验尸官的视觉人格
// 档位:standard。法医报告风:近黑底 + 单一浅灰绿,Courier Prime,
// 像一台老终端在打印验尸报告。冷静,不煽情,完全单色系。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-[#0b0e0c] text-[#b9c6ba]",
  font: "font-typewriter",
  /** 唯一强调色:浅灰绿(老终端荧光的残影) */
  accent: "#8fb096",
  /** 弱化文字 */
  dim: "#5d6a5f",
  /** 分隔线 */
  line: "#2b342d",
  bpVars: {
    "--bp-bg": "#10140f",
    "--bp-fg": "#b9c6ba",
    "--bp-accent": "#8fb096"
  } as CSSProperties
};
