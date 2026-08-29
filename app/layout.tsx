// ============================================================
// app/layout.tsx — 全站骨架:字体变量 + 统一页脚署名
// 页脚口径来自 HANDOFF.md,不要改动措辞。
// ============================================================
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/core/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epoch 0 · First Light Vol.1",
  description: "光还没亮,人先到齐。First Light Vol.1 · 10 个半成品 AI demo"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontVariables}>
      <body className="min-h-dvh flex flex-col font-sans">
        <div className="flex-1">{children}</div>
        <footer className="py-4 text-center text-[10px] tracking-widest opacity-50">
          Epoch 0 · First Light Vol.1 · epoch0.tokyo
        </footer>
      </body>
    </html>
  );
}
