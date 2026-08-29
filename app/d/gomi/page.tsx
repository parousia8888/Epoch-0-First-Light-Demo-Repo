// ============================================================
// app/d/gomi/page.tsx — 垃圾分类相机 📸(vision demo)
// 拍一件垃圾 → gpt-4o-mini 识别 → 按港区规则给结论。
// 8bit 像素风:结果渲染成老游戏对话框;解析不出格式就整段原样显示。
// 坑位:23 区下拉只有港区可选;回収日リマインダー开关拨不动。
// ============================================================
"use client";

import { useState } from "react";
import { theme } from "@/demos/gomi/theme";
import { useGenerate } from "@/core/useGenerate";
import { ImageDrop } from "@/core/ImageDrop";
import { BreakpointCard } from "@/core/BreakpointCard";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "gomi")!;

/* 东京 23 区。坑位①:除港区外全部 disabled。 */
const WARDS = [
  "千代田区", "中央区", "港区", "新宿区", "文京区", "台東区",
  "墨田区", "江東区", "品川区", "目黒区", "大田区", "世田谷区",
  "渋谷区", "中野区", "杉並区", "豊島区", "北区", "荒川区",
  "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区"
];

/* 结果解析:按【标题】切段。切不出至少两段就整段原样显示,绝不崩。 */
function parseSections(text: string): { title: string; body: string }[] | null {
  const matches = Array.from(text.matchAll(/【([^】]+)】\s*([\s\S]*?)(?=【|$)/g));
  if (matches.length < 2) return null;
  return matches.map((m) => ({ title: m[1], body: m[2].trim() }));
}

/* RPG 对话框:白底黑框双层描边 + 右下 ▼ 光标 */
function DialogBox({ text }: { text: string }) {
  const sections = parseSections(text);
  return (
    <div
      className="relative bg-white text-black px-4 py-4 mt-6"
      style={{ border: "4px solid #000", boxShadow: "0 0 0 4px #fff" }}
    >
      {sections ? (
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.title}>
              <div className="text-[12px]" style={{ color: "#b80000" }}>
                ▶ {s.title}
              </div>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{s.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{text}</p>
      )}
      <span className="absolute bottom-1 right-2 text-[12px]" style={{ animation: "gomi-blink 1s steps(1) infinite" }}>
        ▼
      </span>
    </div>
  );
}

export default function Page() {
  const [ward, setWard] = useState("港区");
  const { run, loading, text, error } = useGenerate("gomi");

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`} style={theme.bpVars}>
      {/* 最朴素的 CSS 闪烁,老游戏感,不算动效打磨 */}
      <style>{`@keyframes gomi-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }`}</style>

      <div className="max-w-md mx-auto">
        {/* 标题:游戏卡带开机画面感 */}
        <div className="text-center mb-6 px-3 py-4" style={theme.pixelBorder}>
          <h1 className="text-xl leading-tight">
            {material.emoji} {material.nameJa}
          </h1>
          <p className="text-[12px] mt-1 opacity-80">{material.name} · PUSH CAMERA BUTTON</p>
          <p className="text-[11px] mt-2" style={{ color: theme.accent }}>
            ルール:2026年8月版(ハードコード)
          </p>
        </div>

        {/* 坑位①:区切換。23 区全列出,除港区外全部 disabled */}
        <label className="block mb-4">
          <span className="text-[12px] block mb-1" style={{ color: theme.accent }}>
            ▶ お住まいの区
          </span>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="w-full bg-black text-white text-[14px] px-3 py-2.5 appearance-none rounded-none"
            style={{ border: "4px solid #fff" }}
          >
            {WARDS.map((w) => (
              <option key={w} value={w} disabled={w !== "港区"} className={w !== "港区" ? "pit-locked" : ""}>
                {w}
                {w !== "港区" ? "(準備中)" : ""}
              </option>
            ))}
          </select>
          <span className="text-[11px] opacity-60 block mt-1">※ いまは港区だけ。残り22区は…このテーブルの宿題。</span>
        </label>

        {/* 主路径:拍垃圾 → classify */}
        <div className="px-3 py-3" style={theme.pixelBorder}>
          <ImageDrop
            label="📷 ゴミをうつす"
            onImage={(dataUrl) => {
              void run("classify", { image: dataUrl });
            }}
          />
        </div>

        {/* loading:ハンテイチュウ… 闪烁 */}
        {loading && (
          <div className="text-center mt-6 text-[16px]" style={{ animation: "gomi-blink 0.8s steps(1) infinite" }}>
            ハンテイチュウ…
          </div>
        )}

        {/* 错误:useGenerate 已翻译成人话,直接渲染 */}
        {!loading && error && (
          <div
            className="mt-6 px-4 py-3 text-[13px] bg-black"
            style={{ border: "4px solid #b80000", color: "#ff6b6b" }}
          >
            ✕ {error}
          </div>
        )}

        {/* 结论卡:RPG 对话框 */}
        {!loading && !error && text && <DialogBox text={text} />}

        {/* 坑位②:回収日リマインダー开关,画得出来拨不动(后端 reminder 也是 locked) */}
        <div
          className="pit-locked mt-6 px-3 py-3 flex items-center justify-between bg-black"
          style={{ border: "4px solid #fff" }}
          aria-disabled="true"
        >
          <span className="text-[13px]">🔔 回収日リマインダー</span>
          <span className="flex items-center gap-2">
            <span className="text-[11px]">OFF</span>
            <span className="inline-block w-12 h-6 bg-[#333] relative" style={{ border: "2px solid #fff" }}>
              <span className="absolute left-0 top-0 w-5 h-full bg-white" />
            </span>
          </span>
        </div>

        <BreakpointCard soulPit={material.soulPit} visiblePits={material.visiblePits} />
      </div>
    </main>
  );
}
