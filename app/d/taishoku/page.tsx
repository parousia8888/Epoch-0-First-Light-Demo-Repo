// ============================================================
// app/d/taishoku/page.tsx — 辞职代行 AI 🕊(gsap 档,全场最重的一桌)
// 五个问题 → 生成退職届 + 递交流程 + 法定权利清单。
// 开场:黑屏「お疲れ様でした」逐字浮现(GSAP timeline),只播一次。
// 坑位:「会社との交渉を代行」整块蒙灰盖印;「解雇された場合」置灰。
// ============================================================
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { theme } from "@/demos/taishoku/theme";
import { useGenerate } from "@/core/useGenerate";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "taishoku")!;

const INTRO_TEXT = "お疲れ様でした";
const INTRO_KEY = "taishoku-intro-played";

/** 把 LLM 返回切成三段;切不开返回 null,整段原样显示,不许崩 */
function splitSections(text: string) {
  const m = text.match(/【退職届】([\s\S]*?)【流程】([\s\S]*?)【你的法定权利】([\s\S]*)/);
  if (!m) return null;
  return { todoke: m[1].trim(), flow: m[2].trim(), rights: m[3].trim() };
}

/* 表单一行:小号朱红 label 在上,控件在下,细白线,大量留白 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.25em] mb-1.5" style={{ color: theme.accent }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/15 px-3 py-2.5 text-[15px] text-[#e9e4d8] " +
  "focus:outline-none focus:border-[#c73e3a] appearance-none rounded-none";

export default function Page() {
  const { run, loading, text, error } = useGenerate("taishoku");

  const [employment, setEmployment] = useState("正社員");
  const [years, setYears] = useState("3");
  const [lastDay, setLastDay] = useState("2026-09-30");
  const [reason, setReason] = useState("一身上の都合");
  const [mood, setMood] = useState("会挽留");

  const [introDone, setIntroDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 开场动画:黑屏 → 逐字浮现 → 停一拍 → 整屏淡出、表单从下方升起。只播一次。
  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      /* 隐私模式等拿不到 storage 时照常播 */
    }
    if (played || !overlayRef.current) {
      setIntroDone(true);
      return;
    }
    const chars = overlayRef.current.querySelectorAll(".intro-char");
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          /* ignore */
        }
        setIntroDone(true);
      }
    });
    tl.to(chars, { opacity: 1, y: 0, duration: 0.4, stagger: 0.16, ease: "power2.out" }, 0.5)
      .to(overlayRef.current, { opacity: 0, duration: 0.7, ease: "power1.inOut" }, "+=0.7");
    if (mainRef.current) {
      tl.fromTo(
        mainRef.current,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "<0.25"
      );
    }
    return () => {
      tl.kill();
    };
  }, []);

  // 结果出现时,三个区块依次浮起
  useEffect(() => {
    if (text && resultRef.current) {
      gsap.fromTo(
        resultRef.current.children,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" }
      );
    }
  }, [text]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await run("generate", { employment, years, lastDay, reason, mood });
  };

  const sections = text ? splitSections(text) : null;

  return (
    <main className={`min-h-dvh px-5 pt-10 pb-8 ${theme.page} ${theme.font}`}>
      {/* ── 开场黑幕 ── */}
      {!introDone && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <p className="text-[26px] sm:text-[34px] tracking-[0.35em] pl-[0.35em] text-[#e9e4d8]">
            {INTRO_TEXT.split("").map((c, i) => (
              <span key={i} className="intro-char inline-block opacity-0 translate-y-3">
                {c}
              </span>
            ))}
          </p>
        </div>
      )}

      <div ref={mainRef} className="max-w-md mx-auto">
        {/* ── 题字 ── */}
        <header className="mb-10 text-center">
          <div className="text-3xl mb-3">{material.emoji}</div>
          <h1 className="text-xl tracking-[0.3em] pl-[0.3em]">{material.nameJa}</h1>
          <p className="text-[12px] opacity-60 mt-2 tracking-wider">
            {material.name} · 五问,一份体面的告别
          </p>
          <div className="w-10 h-px mx-auto mt-5" style={{ background: theme.accent }} />
        </header>

        {/* ── 五个问题 ── */}
        <form onSubmit={submit} className="space-y-6 mb-8">
          <Field label="一 · 雇用形態">
            <select className={inputCls} value={employment} onChange={(e) => setEmployment(e.target.value)}>
              <option value="正社員">正社員</option>
              <option value="契約社員">契約社員</option>
              <option value="派遣">派遣</option>
            </select>
          </Field>
          <Field label="二 · 在職年数">
            <input
              className={inputCls}
              type="number"
              min={0}
              max={50}
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="例:3"
            />
          </Field>
          <Field label="三 · 希望する最終出勤日">
            <input
              className={inputCls}
              type="date"
              value={lastDay}
              onChange={(e) => setLastDay(e.target.value)}
            />
          </Field>
          <Field label="四 · 退職理由(対外的な言い方)">
            <input
              className={inputCls}
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="一身上の都合"
            />
          </Field>
          <Field label="五 · 会社の雰囲気">
            <select className={inputCls} value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="好说话">好说话(話しやすい)</option>
              <option value="难说话">难说话(言い出しにくい)</option>
              <option value="会挽留">会挽留(引き止められそう)</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-[15px] tracking-[0.3em] pl-[0.3em] border transition-opacity disabled:opacity-60"
            style={{ borderColor: theme.accent, color: theme.bone, background: "rgba(199,62,58,0.12)" }}
          >
            {loading ? "清書しています…" : "退職届を清書する"}
          </button>
        </form>

        {/* ── loading / error ── */}
        {loading && (
          <p className="text-center text-[12px] tracking-[0.3em] opacity-60 mb-8 animate-pulse">
            墨を磨っています……
          </p>
        )}
        {error && (
          <p className="text-[13px] mb-8 border px-4 py-3" style={{ borderColor: theme.accent, color: theme.accent }}>
            {error}
          </p>
        )}

        {/* ── 结果:三段 or 原样兜底 ── */}
        {text && !loading && (
          <div ref={resultRef} className="space-y-8 mb-10">
            {sections ? (
              <>
                {/* 退職届:一张白纸,文书感,右下朱印 */}
                <section
                  className="relative px-6 py-8 text-black shadow-[0_0_40px_rgba(233,228,216,0.08)]"
                  style={{ background: theme.paper }}
                >
                  <h2 className="text-center text-lg tracking-[0.6em] pl-[0.6em] mb-6">退職届</h2>
                  <pre className="whitespace-pre-wrap break-words text-[13px] leading-[2] font-mincho">
                    {sections.todoke}
                  </pre>
                  {/* 朱印 */}
                  <div
                    className="absolute bottom-5 right-5 w-11 h-11 rounded-full border-2 flex items-center justify-center rotate-[-8deg]"
                    style={{ borderColor: theme.accent, color: theme.accent }}
                  >
                    <span className="text-[15px]">印</span>
                  </div>
                </section>

                {/* 流程 */}
                <section>
                  <h2 className="text-[12px] tracking-[0.3em] mb-3" style={{ color: theme.accent }}>
                    ― 流程 · 提出の手順
                  </h2>
                  <pre className="whitespace-pre-wrap break-words text-[13px] leading-[1.9] opacity-90">
                    {sections.flow}
                  </pre>
                </section>

                {/* 法定权利 */}
                <section>
                  <h2 className="text-[12px] tracking-[0.3em] mb-3" style={{ color: theme.accent }}>
                    ― 你的法定权利 · 法の盾
                  </h2>
                  <pre className="whitespace-pre-wrap break-words text-[13px] leading-[1.9] opacity-90">
                    {sections.rights}
                  </pre>
                </section>
              </>
            ) : (
              /* 格式切不开:整段原样显示,不崩 */
              <section className="border border-white/15 px-5 py-6">
                <pre className="whitespace-pre-wrap break-words text-[13px] leading-[1.9] opacity-90">
                  {text}
                </pre>
              </section>
            )}
          </div>
        )}

        {/* ── 坑位①:代行交涉模块,整块蒙灰 + 旋转朱印 ── */}
        <div className="relative mb-6">
          <div className="pit-locked border border-white/15 px-5 py-6">
            <h2 className="text-[15px] tracking-[0.2em] mb-2">会社との交渉を代行</h2>
            <p className="text-[12px] leading-relaxed opacity-80 mb-4">
              上司への連絡、引き止めへの応対、退職日の調整——すべて AI があなたの代わりに。
              あなたはもう、誰とも話さなくていい。
            </p>
            <button disabled className="w-full py-3 text-[13px] tracking-[0.2em] border border-white/25">
              🔒 交渉を依頼する
            </button>
          </div>
          {/* 印章不随模块蒙灰,盖在正中 */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <span
              className="rotate-[-12deg] border-[3px] px-4 py-2 text-[15px] tracking-[0.25em] font-bold"
              style={{ borderColor: theme.accent, color: theme.accent, background: "rgba(0,0,0,0.55)" }}
            >
              弁護士法確認中
            </span>
          </div>
        </div>

        {/* ── 坑位②:解雇场景入口置灰 ── */}
        <button disabled className="pit-locked w-full py-3 text-[13px] tracking-[0.2em] border border-white/25 mb-2">
          🔒 解雇された場合はこちら(未対応)
        </button>

      </div>
    </main>
  );
}
