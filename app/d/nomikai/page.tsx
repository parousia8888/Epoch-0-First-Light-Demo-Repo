// ============================================================
// app/d/nomikai/page.tsx — 饮み会遁走器 🏮(gsap 档动效担当)
// 场景 ×3 + 强度滑杆 → LLM 生成三条拒绝话术(带翻车风险)。
// 核心彩蛋:滑杆拖到 80+ 被 GSAP 物理弹回 79(まだ早い)。
// 结构:世界观容器 → 表单 → 结果 → 置灰的坑
// ============================================================
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGenerate } from "@/core/useGenerate";
import { theme } from "@/demos/nomikai/theme";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "nomikai")!;

const SCENES = [
  { key: "bumon", ja: "部署の飲み会", note: "上司在场,留余地" },
  { key: "nijikai", ja: "二次会", note: "一次会已尽义务" },
  { key: "kinyobi", ja: "金曜の残業後", note: "只想直接回家" }
] as const;
type SceneKey = (typeof SCENES)[number]["key"];

interface Candidate {
  plan: string;
  risk: string;
}

/** 把「案1: … 风险: …」结构的纯文本拆成候选卡;拆不出返回 null,由页面整段兜底显示 */
function parseCandidates(raw: string): Candidate[] | null {
  const re = /案\s*\d+\s*[::]\s*([\s\S]*?)\n\s*(?:风险|風険|リスク)\s*[::]\s*([^\n]*)/g;
  const out: Candidate[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const plan = (m[1] ?? "").trim();
    const risk = (m[2] ?? "").trim();
    if (plan) out.push({ plan, risk });
  }
  return out.length > 0 ? out : null;
}

export default function Page() {
  const { run, loading, text, error } = useGenerate("nomikai");
  const [scene, setScene] = useState<SceneKey>("bumon");
  const [intensity, setIntensity] = useState(40);
  const [toastOn, setToastOn] = useState(false);

  const lanternRef = useRef<HTMLSpanElement>(null);
  const sliderWrapRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bouncingRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 🏮 灯笼缓慢摇曳:transform-origin 挂在顶部,像被门帘的风吹到 */
  useEffect(() => {
    const el = lanternRef.current;
    if (!el) return;
    const sway = gsap.fromTo(
      el,
      { rotation: -6 },
      { rotation: 6, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% -15%" }
    );
    return () => {
      sway.kill();
      tweenRef.current?.kill();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* 彩蛋本体:80+ 触发 GSAP elastic 回弹到 79 + 整条滑杆抖动 + まだ早い */
  const snapBack = useCallback((from: number) => {
    bouncingRef.current = true;
    setToastOn(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastOn(false), 1600);

    tweenRef.current?.kill();
    const proxy = { v: from };
    tweenRef.current = gsap.to(proxy, {
      v: 79,
      duration: 1.05,
      ease: "elastic.out(1.05, 0.32)",
      onUpdate: () => setIntensity(Math.max(0, Math.round(proxy.v))),
      onComplete: () => {
        bouncingRef.current = false;
        setIntensity(79);
      }
    });
    if (sliderWrapRef.current) {
      gsap.fromTo(
        sliderWrapRef.current,
        { x: 0 },
        { keyframes: [{ x: -8 }, { x: 6 }, { x: -4 }, { x: 2 }, { x: 0 }], duration: 0.45, ease: "power2.out" }
      );
    }
  }, []);

  const onSlide = useCallback(
    (raw: number) => {
      if (bouncingRef.current) return; // 回弹动画期间不接受拖拽噪音
      const v = Math.min(Math.max(raw, 0), 100);
      if (v >= 80) {
        setIntensity(v); // 先让指针到达现场,下一帧开始弹回,更有"撞墙"感
        snapBack(v);
        return;
      }
      setIntensity(v);
    },
    [snapBack]
  );

  /* まだ早い 提示的弹出动画 */
  useEffect(() => {
    if (toastOn && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { y: 8, scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.5)" }
      );
    }
  }, [toastOn]);

  const candidates = useMemo(() => (text ? parseCandidates(text) : null), [text]);

  /* 候选卡错落浮现(stagger,克制) */
  useEffect(() => {
    if (!text || !cardsRef.current) return;
    const els = cardsRef.current.querySelectorAll(".nomikai-card");
    if (els.length === 0) return;
    gsap.fromTo(
      els,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.14, ease: "power3.out" }
    );
  }, [text]);

  const generate = () => {
    if (loading) return;
    // 双保险:就算状态被绕出 79,发请求前再钳制一次
    void run("excuse", { scene, intensity: String(Math.min(intensity, 79)) });
  };

  const mood =
    intensity <= 30 ? "また今度…(委婉含糊)" : intensity <= 60 ? "ちょっと今日は(明确但客气)" : "帰ります(直接坚定)";

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`}>
      {/* 滑杆的居酒屋质感:暖黄轨道 + 80-100 的封条区 */}
      <style>{`
        .nomikai-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 10px;
          border-radius: 9999px;
          outline: none;
          background-image:
            repeating-linear-gradient(135deg, rgba(212,72,62,0.55) 0 3px, transparent 3px 7px),
            linear-gradient(rgba(28,17,11,0.62), rgba(28,17,11,0.62)),
            linear-gradient(to right, #5c3a17, #f0b24a);
          background-size: 20% 100%, 20% 100%, 100% 100%;
          background-position: right, right, left;
          background-repeat: no-repeat;
        }
        .nomikai-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #ffe6ad, #f0b24a 55%, #b87616);
          border: 2px solid #3a2412;
          box-shadow: 0 0 12px rgba(240, 178, 74, 0.55);
          cursor: pointer;
        }
        .nomikai-range::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #ffe6ad, #f0b24a 55%, #b87616);
          border: 2px solid #3a2412;
          box-shadow: 0 0 12px rgba(240, 178, 74, 0.55);
          cursor: pointer;
        }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* 店头:摇曳的灯笼 + 手写店名 */}
        <header className="text-center mb-7">
          <span ref={lanternRef} className="inline-block text-5xl select-none" aria-hidden>
            {material.emoji}
          </span>
          <h1 className="text-2xl mt-2" style={{ color: theme.accent }}>
            {material.name}
          </h1>
          <p className="text-sm opacity-70 mt-1">{material.nameJa} · 帰りたい夜の、ための道具</p>
        </header>

        {/* 场景选择 */}
        <section className="mb-6">
          <h2 className="text-sm mb-2 opacity-80">▍今晩の場面は?</h2>
          <div className="grid grid-cols-3 gap-2">
            {SCENES.map((s) => {
              const active = scene === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setScene(s.key)}
                  className="rounded-lg border px-2 py-3 text-center transition-colors"
                  style={{
                    background: active ? "rgba(240,178,74,0.14)" : theme.card,
                    borderColor: active ? theme.accent : theme.border,
                    color: active ? theme.accent : undefined
                  }}
                >
                  <span className="block text-[13px] leading-tight">{s.ja}</span>
                  <span className="block text-[10px] opacity-60 mt-1 leading-tight">{s.note}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 强度滑杆(彩蛋区) */}
        <section className="mb-7">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-sm opacity-80">▍逃げたい度</h2>
            <span className="text-lg tabular-nums" style={{ color: theme.accent }}>
              {intensity}%
            </span>
          </div>
          <div ref={sliderWrapRef} className="relative">
            {toastOn && (
              <div
                ref={toastRef}
                className="absolute -top-10 right-0 px-3 py-1.5 rounded-lg text-sm text-[#fff3df] shadow-lg pointer-events-none"
                style={{ background: theme.lantern }}
              >
                まだ早い
              </div>
            )}
            <input
              type="range"
              min={0}
              max={100}
              value={intensity}
              onChange={(e) => onSlide(Number(e.target.value))}
              className="nomikai-range"
              aria-label="拒绝强度"
            />
          </div>
          <div className="flex justify-between items-start mt-1.5 text-[10px] opacity-70">
            <span>0 やんわり</span>
            <span className="text-right" style={{ color: theme.lantern }}>
              80–100 上級者モード:未開放 🔒
            </span>
          </div>
          <p className="text-xs opacity-70 mt-2">いま:{mood}</p>
        </section>

        {/* 生成 */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-base transition-opacity disabled:opacity-60"
          style={{ background: theme.accent, color: "#2a1508" }}
        >
          {loading ? "言い訳を考え中…🏮" : "言い訳をください"}
        </button>

        {/* 结果区 */}
        <section className="mt-6" ref={cardsRef}>
          {error && (
            <p className="text-sm rounded-lg border px-3 py-2.5" style={{ borderColor: theme.lantern, color: theme.lantern }}>
              {error}
            </p>
          )}

          {text && candidates && (
            <div className="space-y-3">
              {candidates.map((c, i) => (
                <article
                  key={i}
                  className="nomikai-card rounded-xl border p-4 opacity-0"
                  style={{ background: theme.card, borderColor: theme.border }}
                >
                  <div className="text-[10px] tracking-widest mb-1.5" style={{ color: theme.accent }}>
                    案 {i + 1}
                  </div>
                  <p className="text-[15px] leading-relaxed">{c.plan}</p>
                  {c.risk && (
                    <p className="text-xs mt-2.5 pt-2 border-t leading-relaxed" style={{ borderColor: theme.border, color: theme.lantern }}>
                      ⚠ 翻车风险:{c.risk}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* 解析不出格式时:整段原样兜底,绝不崩 */}
          {text && !candidates && (
            <article
              className="nomikai-card rounded-xl border p-4 opacity-0"
              style={{ background: theme.card, borderColor: theme.border }}
            >
              <div className="text-[10px] tracking-widest mb-1.5 opacity-60">原文のまま</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
            </article>
          )}
        </section>

        {/* ↓ 桌卡坑位②:既読スルー生成置灰(后端 kidoku 也是 locked) */}
        <button disabled className="pit-locked w-full rounded-xl border py-3 text-sm mt-6" style={{ borderColor: theme.border, background: theme.card }}>
          🔒 既読スルー生成(未開放)
        </button>

      </div>
    </main>
  );
}
