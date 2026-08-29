// ============================================================
// app/d/roulette/page.tsx — 赤坂午饭轮盘 🎰(gsap 档,全场压轴动效)
// 纯前端无 LLM。店铺库在 demos/roulette/data.ts(硬编码 20 家)。
// 主路径:回す → 老虎机滚轮长加速 → 三段非线性减速+逐格蹭停 →
//         back 回弹停格 → 霓虹闪烁 → 店卡(店名+genre+徒歩◯分)。
// 「打破惯性算法」= 随机 + 排除上一次转出的 genre(state 记忆,不持久化)。
// ============================================================
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SHOPS, type Shop } from "@/demos/roulette/data";
import { theme } from "@/demos/roulette/theme";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "roulette")!;

/* ---- 滚轮几何:一格 56px,开窗露 3 格,中间格为停格位 ---- */
const ITEM_H = 56;
const LEN = SHOPS.length; // 20
const REPEAT = 12; // 条带 = 20 家 × 12 圈,保证一次长转不越界
const START_POS = 20; // 从第二圈起步,上下都有内容

/** 让第 i 格停在开窗中间那一行时,条带的 y 值 */
const yFor = (i: number) => -(i - 1) * ITEM_H;

export default function Page() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ shop: Shop; spinId: number } | null>(null);
  const [lastGenre, setLastGenre] = useState<string | null>(null);
  const [muted, setMuted] = useState(true); // 装饰:没有音频文件,只有开关

  const reelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(START_POS); // 当前停在中间行的绝对格号
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  /* 条带内容:20 家固定顺序重复 12 圈,第 i 格 = SHOPS[i % 20] */
  const strip: Shop[] = Array.from({ length: LEN * REPEAT }, (_, i) => SHOPS[i % LEN]);

  const spin = () => {
    if (spinning || !reelRef.current) return;

    /* 打破惯性:候选里排除上一次转出的 genre,再纯随机 */
    const candidates = lastGenre ? SHOPS.filter((s) => s.genre !== lastGenre) : SHOPS;
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    const baseIdx = SHOPS.indexOf(winner);

    /* 目标格:往前至少转 55 格(约 3 圈)再落在 winner 上 */
    const pos = posRef.current;
    const minTravel = 55 + Math.floor(Math.random() * LEN);
    let target = pos + minTravel;
    target += (((baseIdx - target) % LEN) + LEN) % LEN;

    setSpinning(true);
    setResult(null);

    const reel = reelRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        /* 静默归位到等价格号(同一家店),下次还能再转 3 圈 */
        const home = (target % LEN) + LEN;
        posRef.current = home;
        gsap.set(reel, { y: yFor(home) });
        setLastGenre(winner.genre);
        setResult({ shop: winner, spinId: Date.now() });
        setSpinning(false);
      }
    });
    tlRef.current = tl;

    /* ① 长加速:吃掉大约一半路程,速度感用 blur 叠上去 */
    const accelEnd = pos + Math.round((target - 8 - pos) * 0.55);
    tl.to(reel, { y: yFor(accelEnd), duration: 0.8, ease: "power2.in" });
    tl.to(reel, { filter: "blur(5px)", duration: 0.35, ease: "none" }, 0.35);

    /* ② 全速直线段 */
    tl.to(reel, { y: yFor(target - 8), duration: 0.55, ease: "none" });

    /* ③ 三段非线性减速:先快减(5 格)…… */
    tl.to(reel, { y: yFor(target - 3), duration: 0.85, ease: "power2.out" });
    tl.to(reel, { filter: "blur(0px)", duration: 0.4, ease: "power1.out" }, "<");

    /* ……再慢爬、最后一格一格蹭 */
    tl.to(reel, { y: yFor(target - 2), duration: 0.3, ease: "power1.inOut" });
    tl.to(reel, { y: yFor(target - 1), duration: 0.44, ease: "power1.inOut" });

    /* ④ 停格:back ease 轻微回弹 */
    tl.to(reel, { y: yFor(target), duration: 0.6, ease: "back.out(2.2)" });
  };

  /* ⑤ 霓虹庆祝:结果卡边框 neon 闪两下 */
  useEffect(() => {
    if (!result || !cardRef.current) return;
    const flash = gsap.fromTo(
      cardRef.current,
      { boxShadow: `0 0 6px rgba(255,45,149,0.35), inset 0 0 4px rgba(255,45,149,0.2)` },
      {
        boxShadow: `0 0 18px rgba(255,45,149,0.95), 0 0 46px rgba(255,45,149,0.5), inset 0 0 10px rgba(255,45,149,0.45)`,
        duration: 0.16,
        repeat: 3,
        yoyo: true,
        ease: "power2.inOut"
      }
    );
    return () => {
      flash.kill();
    };
  }, [result]);

  /* 组件卸载时杀掉进行中的 timeline */
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`}>
      <div className="max-w-md mx-auto">
        {/* 世界观容器:霓虹招牌头 + 装饰静音开关 */}
        <header className="mb-6 text-center relative">
          <button
            type="button"
            aria-label={muted ? "ミュート中(装飾)" : "サウンドON(装飾)"}
            onClick={() => setMuted((m) => !m)}
            className="absolute right-0 top-0 text-lg opacity-60"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <h1
            className="font-dot text-2xl tracking-wider"
            style={{ color: theme.accent, textShadow: theme.glowPink }}
          >
            {material.emoji} {material.nameJa}
          </h1>
          <p className="text-[12px] mt-1.5 opacity-70">
            {material.name} · 半径500mから、最近食べてないジャンルを一発抽選
          </p>
        </header>

        {/* 老虎机:金属边框开窗 */}
        <div
          className="rounded-2xl p-[3px]"
          style={{
            background:
              "linear-gradient(160deg, #e8e8f2 0%, #9a9aac 22%, #55556a 50%, #b9b9c9 78%, #6c6c80 100%)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.55)"
          }}
        >
          <div className="rounded-[13px] px-4 pt-4 pb-5" style={{ background: theme.panel }}>
            {/* 开窗 */}
            <div
              className="relative overflow-hidden rounded-lg border border-black/70 bg-[#0c0716]"
              style={{ height: ITEM_H * 3 }}
            >
              {/* 条带 */}
              <div
                ref={reelRef}
                className="will-change-transform"
                style={{ transform: `translateY(${yFor(START_POS)}px)` }}
              >
                {strip.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center px-3"
                    style={{ height: ITEM_H }}
                  >
                    <span className="font-dot text-[19px] tracking-wide whitespace-nowrap">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
              {/* 上下暗角:滚筒弧面感 */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0"
                style={{
                  height: ITEM_H,
                  background: "linear-gradient(to bottom, rgba(12,7,22,0.95), rgba(12,7,22,0))"
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0"
                style={{
                  height: ITEM_H,
                  background: "linear-gradient(to top, rgba(12,7,22,0.95), rgba(12,7,22,0))"
                }}
              />
              {/* 中间停格线:霓虹青 */}
              <div
                className="pointer-events-none absolute inset-x-0"
                style={{
                  top: ITEM_H,
                  height: ITEM_H,
                  borderTop: `1px solid ${theme.cyan}`,
                  borderBottom: `1px solid ${theme.cyan}`,
                  boxShadow: `inset 0 0 14px rgba(46,230,255,0.14)`
                }}
              />
              {/* 左右指针 */}
              <div
                className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[10px]"
                style={{ color: theme.cyan, textShadow: theme.glowCyan }}
              >
                ▶
              </div>
              <div
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px]"
                style={{ color: theme.cyan, textShadow: theme.glowCyan }}
              >
                ◀
              </div>
            </div>

            {/* 回す:大按钮,拇指友好 */}
            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className="mt-4 w-full rounded-xl py-4 font-dot text-xl tracking-[0.4em] text-[#180a12] transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{
                background: spinning
                  ? "linear-gradient(180deg, #8a2456, #5f1a3c)"
                  : "linear-gradient(180deg, #ff5fb0, #ff2d95 55%, #d1176f)",
                boxShadow: spinning
                  ? "none"
                  : "0 0 16px rgba(255,45,149,0.55), 0 4px 0 #8f0f4e"
              }}
            >
              {spinning ? "回転中…" : "回す"}
            </button>

            {/* 打破惯性:排除中的 genre */}
            <p className="mt-2.5 text-center text-[11px] opacity-70">
              {lastGenre ? (
                <>
                  前回のジャンル
                  <span className="mx-1 font-bold" style={{ color: theme.gold }}>
                    「{lastGenre}」
                  </span>
                  は除外中 — 惯性、打破します
                </>
              ) : (
                "同じジャンルは連続で出ません(惯性打破アルゴリズム)"
              )}
            </p>
          </div>
        </div>

        {/* 结果店卡 */}
        {result && (
          <div
            ref={cardRef}
            key={result.spinId}
            className="mt-5 rounded-xl border px-5 py-5 text-center"
            style={{ borderColor: theme.accent, background: theme.panel }}
          >
            <p className="text-[10px] tracking-[0.4em] opacity-60 mb-2">本日のランチ</p>
            <p
              className="font-dot text-[26px] leading-tight"
              style={{ color: theme.gold, textShadow: "0 0 6px rgba(255,217,59,0.8), 0 0 18px rgba(255,217,59,0.4)" }}
            >
              {result.shop.name}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[12px]">
              <span
                className="rounded-full border px-2.5 py-0.5"
                style={{ borderColor: theme.cyan, color: theme.cyan }}
              >
                {result.shop.genre}
              </span>
              <span className="opacity-80">
                徒歩 <span className="font-dot text-[15px]" style={{ color: theme.cyan }}>{result.shop.walkMin}</span> 分
              </span>
            </div>
          </div>
        )}

        {/* ↓ 桌卡坑位①:半径滑杆画出来但锁死在 500m */}
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5" style={{ background: theme.panel }}>
          <span className="text-[12px] shrink-0 opacity-80">半径を変更</span>
          <input
            type="range"
            min={100}
            max={2000}
            defaultValue={500}
            disabled
            className="pit-locked w-full accent-[#ff2d95]"
          />
          <span className="text-[11px] shrink-0 font-dot" style={{ color: theme.accent }}>
            500m 固定
          </span>
        </div>

        {/* ↓ 桌卡坑位②:店铺库手動入力,自動取得置灰(后端 auto_fetch 也是 locked) */}
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2.5" style={{ background: theme.panel }}>
          <span className="text-[12px] opacity-80">
            店舗データベース:<span className="font-dot" style={{ color: theme.gold }}>20/∞</span> 件 · 手動入力
          </span>
          <button
            type="button"
            disabled
            className="pit-locked shrink-0 rounded border border-white/25 px-3 py-1.5 text-[12px]"
          >
            🔒 自動取得
          </button>
        </div>

      </div>
    </main>
  );
}
