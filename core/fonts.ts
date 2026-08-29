// ============================================================
// core/fonts.ts — 五个 Google 字体,一次声明,全场共用
// 每个 demo 的 theme 通过 Tailwind 的 font-mincho / font-dot /
// font-typewriter / font-hand / font-sans 类名取用。
// 日文字体体积大,preload 关掉,按需加载。
// ============================================================
import {
  Shippori_Mincho,
  DotGothic16,
  Courier_Prime,
  Yomogi,
  Noto_Sans_JP
} from "next/font/google";

export const shippori = Shippori_Mincho({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-shippori",
  preload: false
});

export const dotgothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dotgothic",
  preload: false
});

export const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier"
});

export const yomogi = Yomogi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yomogi",
  preload: false
});

export const noto = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  preload: false
});

/** 拼好的变量类名,layout.tsx 挂到 <html> 上 */
export const fontVariables = [
  shippori.variable,
  dotgothic.variable,
  courier.variable,
  yomogi.variable,
  noto.variable
].join(" ");
