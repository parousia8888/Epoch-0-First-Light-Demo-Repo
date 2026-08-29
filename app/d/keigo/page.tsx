// ============================================================
// app/d/keigo/page.tsx — 敬语邮件改写器 ✉️(gsap 档)
// 草稿 + 场景 → LLM 改写成得体商务日语。prompt 在 demos/keigo/config.ts。
// 结构:世界观容器 → 表单 → 信笺展开结果(GSAP) → 置灰的坑
// 动效只在结果出现时跑一次:clip-path 揭示 + 轻微纸张摆动 + 朱笔渐显。
// ============================================================
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { theme } from "@/demos/keigo/theme";
import { useGenerate } from "@/core/useGenerate";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "keigo")!;

/* 预填草稿:现场没人用手机打长文,一进来点一下就能跑通 */
const SAMPLE_DRAFT = `田中さん、お疲れ様です。

すみません、ちょっとお願いがあります。
来週のプレゼン資料を作っていますが、先月の売上データがないので、作れません。
田中さんはデータを持っていると聞きました。
時間があるとき、私に送ってください。
早ければ早いほどいいです。
よろしくお願いします。`;

const SCENES = [
  { key: "onegai", ja: "依頼", zh: "拜托" },
  { key: "houkoku", ja: "報告", zh: "汇报" },
  { key: "kansha", ja: "お礼", zh: "感谢" }
] as const;

/* 桌卡坑位①:两个后端真的 403 的场景 */
const LOCKED_SCENES = [
  { key: "claim", ja: "クレーム対応" },
  { key: "apology", ja: "謝罪" }
] as const;

/** 按【改动理由】切开;切不开时 reasons 为 null,整段原样显示,不许崩 */
function splitResult(raw: string): { rewrite: string; reasons: string | null } {
  const marker = "【改动理由】";
  const idx = raw.indexOf(marker);
  if (idx === -1) return { rewrite: raw.trim(), reasons: null };
  return {
    rewrite: raw.slice(0, idx).replace("【改写稿】", "").trim(),
    reasons: raw.slice(idx + marker.length).trim()
  };
}

/** 理由行里的「→」用朱笔色标出来 */
function ReasonLine({ line }: { line: string }) {
  const parts = line.split("→");
  return (
    <>
      {parts.map((seg, i) => (
        <Fragment key={i}>
          {i > 0 && <span style={{ color: theme.accent }}>→</span>}
          {seg}
        </Fragment>
      ))}
    </>
  );
}

export default function Page() {
  const [draft, setDraft] = useState(SAMPLE_DRAFT);
  const [scene, setScene] = useState<string>("onegai");
  const [lockedTip, setLockedTip] = useState<string | null>(null);
  const { run, loading, text, error } = useGenerate("keigo");

  const letterRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const reasonsRef = useRef<HTMLDivElement>(null);

  const { rewrite, reasons } = splitResult(text);

  /* 点锁死按钮:手机上没有 hover,点击也要能看到「未対応」 */
  const tapLocked = (key: string) => {
    setLockedTip(key);
    window.setTimeout(() => setLockedTip((k) => (k === key ? null : k)), 1500);
  };

  /* 信笺展开:clip-path 从上往下揭示 + 很轻的一次摆动,理由与朱印稍后渐显 */
  useEffect(() => {
    if (!text || !letterRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      letterRef.current,
      { clipPath: "inset(0 0 100% 0)", opacity: 1 },
      { clipPath: "inset(0 0 -2% 0)", duration: 1.0, ease: "power2.inOut" }
    );
    tl.fromTo(
      letterRef.current,
      { rotation: -0.7, transformOrigin: "50% 0%" },
      { rotation: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" },
      "<0.25"
    );
    if (sealRef.current) {
      tl.fromTo(
        sealRef.current,
        { autoAlpha: 0, scale: 1.4, rotation: -14 },
        { autoAlpha: 0.9, scale: 1, rotation: -8, duration: 0.45, ease: "power3.out" },
        "-=0.5"
      );
    }
    if (reasonsRef.current) {
      tl.fromTo(
        reasonsRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );
      tl.fromTo(
        reasonsRef.current.querySelectorAll("[data-shu]"),
        { autoAlpha: 0, x: -4 },
        { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.09, ease: "power2.out" },
        "<0.15"
      );
    }
    return () => {
      tl.kill();
    };
  }, [text]);

  const sceneBtn = (active: boolean) =>
    `border px-3 py-2 text-[13px] leading-tight transition-colors ${
      active
        ? "bg-[#221f1a] text-[#fbf8ef] border-[#221f1a]"
        : "bg-[#fbf8ef] text-[#221f1a] border-[#221f1a]/40"
    }`;

  return (
    <main className={`min-h-dvh px-4 pt-10 pb-8 ${theme.page} ${theme.font}`}>
      <div className="max-w-md mx-auto">
        {/* 世界观容器:信笺头,细双线 + 朱色一点 */}
        <header className="mb-7 border-y border-[#221f1a]/70 py-4 relative">
          <div className="absolute inset-x-0 top-[3px] border-t border-[#221f1a]/30" />
          <div className="absolute inset-x-0 bottom-[3px] border-b border-[#221f1a]/30" />
          <h1 className="text-xl font-bold tracking-wide">
            {material.emoji} {material.nameJa}
          </h1>
          <p className="text-[12px] mt-1 opacity-70">
            {material.name} · 中文思路の下書きを、場面に合う商務日本語へ清書します
          </p>
        </header>

        {/* 草稿 */}
        <label className="block text-[12px] tracking-[0.2em] opacity-70 mb-2">
          下書き · 日语草稿
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          className="w-full bg-[#fbf8ef] border border-[#221f1a]/40 px-3 py-3 text-[14px] leading-relaxed resize-y focus:outline-none focus:border-[#b3341f]/70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, rgba(34,31,26,0.07) 27px, rgba(34,31,26,0.07) 28px)"
          }}
        />

        {/* 场景 */}
        <div className="mt-4 mb-2 text-[12px] tracking-[0.2em] opacity-70">場面 · 场景</div>
        <div className="flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScene(s.key)}
              className={sceneBtn(scene === s.key)}
            >
              {s.ja}
              <span className="block text-[10px] opacity-60">{s.zh}</span>
            </button>
          ))}
          {/* ↓ 桌卡坑位①:投诉与道歉锁死,后端也会 403。hover/点击显示「未対応」 */}
          {LOCKED_SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-disabled="true"
              onClick={() => tapLocked(s.key)}
              className="pit-locked group relative border border-[#221f1a]/40 bg-[#fbf8ef] px-3 py-2 text-[13px] leading-tight"
            >
              🔒 {s.ja}
              <span className="block text-[10px] opacity-60">&nbsp;</span>
              <span
                className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-0.5 bg-[#221f1a] text-[#fbf8ef] ${
                  lockedTip === s.key ? "block" : "hidden group-hover:block"
                }`}
              >
                未対応
              </span>
            </button>
          ))}
        </div>

        {/* ↓ 桌卡坑位②:语气强度滑杆画出来但不可拖动 */}
        <div className="mt-4 flex items-center gap-3 border border-[#221f1a]/25 bg-[#fbf8ef]/60 px-3 py-2.5">
          <span className="text-[12px] shrink-0 opacity-80">語気の強さ</span>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={50}
            disabled
            className="pit-locked w-full accent-[#b3341f]"
          />
          <span className="text-[10px] shrink-0" style={{ color: theme.accent }}>
            未対応
          </span>
        </div>

        {/* 提交 */}
        <button
          type="button"
          disabled={loading || !draft.trim()}
          onClick={() => void run("rewrite", { scene, draft })}
          className="mt-5 w-full bg-[#221f1a] text-[#fbf8ef] py-3.5 text-[15px] tracking-[0.3em] disabled:opacity-40"
        >
          {loading ? "清書中…" : "清書する"}
        </button>

        {/* loading:世界观里的等待 */}
        {loading && (
          <div className="mt-6 border border-[#221f1a]/25 bg-[#fbf8ef] px-4 py-8 text-center animate-pulse">
            <p className="text-[14px] tracking-[0.35em]">ただいま清書中…</p>
            <p className="text-[11px] mt-2 opacity-60">秘書室にて筆をとっております ✒️</p>
          </div>
        )}

        {error && !loading && (
          <p className="mt-6 text-[13px] border border-[#b3341f]/60 px-3 py-2.5" style={{ color: theme.accent }}>
            {error}
          </p>
        )}

        {/* 结果:和纸信笺,GSAP 展开 */}
        {text && !loading && (
          <section className="mt-7">
            <div
              ref={letterRef}
              className="relative border border-[#221f1a]/30 px-5 py-6 shadow-[0_2px_10px_rgba(34,31,26,0.10)]"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 0%, #fefcf5 0%, #fbf8ef 55%, #f6f0e0 100%)",
                clipPath: "inset(0 0 -2% 0)"
              }}
            >
              {/* 朱印:清書済 */}
              <div
                ref={sealRef}
                className="absolute top-3 right-3 border-2 px-1.5 py-1 text-[10px] font-bold leading-tight opacity-0"
                style={{ color: theme.accent, borderColor: theme.accent, transform: "rotate(-8deg)" }}
              >
                清書済
              </div>
              <h2 className="text-[11px] tracking-[0.35em] opacity-60 mb-3">改写稿 · 清書</h2>
              <p className="text-[14px] leading-[1.9] whitespace-pre-wrap">{rewrite}</p>
            </div>

            {/* 改动理由:朱笔批注,稍后渐显。mock 返回不合格式时 reasons 为 null,不渲染此块 */}
            {reasons && (
              <div
                ref={reasonsRef}
                className="mt-3 border-l-2 pl-4 pr-1 py-3"
                style={{ borderColor: theme.accent, opacity: 0 }}
              >
                <h3 className="text-[11px] tracking-[0.35em] mb-2" style={{ color: theme.accent }}>
                  改动理由 · 朱筆
                </h3>
                <ul className="space-y-2">
                  {reasons
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i} data-shu className="flex gap-2 text-[12.5px] leading-relaxed">
                        <span className="shrink-0 select-none" style={{ color: theme.accent }}>
                          ｜
                        </span>
                        <span className="opacity-90">
                          <ReasonLine line={line} />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}
