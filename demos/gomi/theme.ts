// ============================================================
// demos/gomi/theme.ts — 垃圾分类相机的视觉人格
// 档位:rough。FC 游戏机 / 8bit:深蓝黑底、白字、像素双层描边,
// 识别结果做成老 RPG 对话框。【纪律】糙即世界观,不加动效不打磨。
// ============================================================
import type { CSSProperties } from "react";

export const theme = {
  page: "bg-[#0b0b2e] text-white",
  font: "font-dot",
  /** FC 金币黄 */
  accent: "#f8b800",
  /** 像素双层描边:外白内黑,糊在深蓝底上就是 FC 味 */
  pixelBorder: {
    border: "4px solid #ffffff",
    boxShadow: "0 0 0 4px #000000"
  } as CSSProperties,
};
