// ============================================================
// app/qr/page.tsx — 桌卡二维码打印页(host 专用,不在首页索引里)
// 打开后浏览器 Cmd+P 直接打印:首页 + 10 个 demo,每桌剪一张。
// 二维码指向当前部署的域名(本地打开就是本地地址,线上打开就是
// 线上地址),所以请在正式部署的站点上打印。
// ============================================================
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { demos } from "@/demos-material";

interface Card {
  path: string;
  emoji: string;
  name: string;
  sub: string;
  dataUrl: string;
}

export default function QrPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const o = window.location.origin;
    setOrigin(o);
    const targets = [
      { path: "/", emoji: "🌅", name: "First Light Vol.1", sub: "demo 索引 · 扫这个进全部" },
      ...demos.map((d) => ({ path: `/d/${d.slug}`, emoji: d.emoji, name: d.name, sub: d.nameJa }))
    ];
    Promise.all(
      targets.map(async (t) => ({
        ...t,
        dataUrl: await QRCode.toDataURL(`${o}${t.path}`, { width: 480, margin: 1 })
      }))
    ).then(setCards);
  }, []);

  return (
    <main className="bg-white text-black min-h-dvh px-6 py-8 print:p-0">
      <header className="mb-6 print:hidden">
        <h1 className="text-xl font-bold">桌卡二维码 · {origin}</h1>
        <p className="text-sm opacity-60 mt-1">
          Cmd+P / Ctrl+P 打印本页。⚠️ 确认地址栏是正式部署的域名,别把 localhost 印出去。
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <figure
            key={c.path}
            className="border-2 border-black rounded-lg p-4 flex flex-col items-center text-center break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.dataUrl} alt={c.name} className="w-full max-w-[180px]" />
            <figcaption className="mt-2">
              <p className="text-sm font-bold leading-tight">
                {c.emoji} {c.name}
              </p>
              <p className="text-[10px] opacity-60">{c.sub}</p>
              <p className="text-[9px] opacity-40 mt-1 font-mono">{c.path}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <footer className="mt-6 text-center text-[10px] opacity-50">
        Epoch 0 · First Light Vol.1 · epoch0.tokyo
      </footer>
    </main>
  );
}
