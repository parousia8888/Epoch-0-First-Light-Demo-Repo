// ============================================================
// app/d/chintai/page.tsx — 找房初期费用拆解器 🏠(rough 档)
// 粘贴房源页文本 → LLM 拆项 → 三色判定表(行情内/偏高/可谈)。
// 房产传单风:粗黑边框 + 荧光黄 + 红色大字,丑得理直气壮。
// 解析不出 LLM 返回格式时整段原样显示,绝不崩。
// ============================================================
"use client";

import { useState } from "react";
import { theme } from "@/demos/chintai/theme";
import { useGenerate } from "@/core/useGenerate";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "chintai")!;

/* 预填的房源文本:典型的初期费用全家桶,现场一点就能跑 */
const SAMPLE_LISTING = `【山手線 大塚駅 徒歩8分】陽当たり良好!人気の1K☆
家賃 8.2万円 / 管理費 5,000円
礼金1ヶ月 敷金1ヶ月
仲介手数料:賃料の1.1ヶ月分(税込)
保証会社利用必須(初回保証料:賃料の50%)
火災保険 20,000円(2年)
鍵交換代 16,500円(税込)
24時間サポート 16,500円 加入必須
室内消毒代 15,000円
入居可能日:即日 敷金0円プランあり!お問い合わせはお早めに!`;

/* 【拆解】区块逐行 split("|"),任何一行不是 4 段就返回 null → 整段原样显示 */
interface Parsed {
  rows: string[][];
  total: string;
  notice: string;
}
function parseResult(text: string): Parsed | null {
  const m = text.match(/【拆解】([\s\S]*?)【合计】([\s\S]*?)(?:【提醒】([\s\S]*))?$/);
  if (!m) return null;
  const rows = m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((c) => c.trim()));
  if (rows.length === 0 || rows.some((r) => r.length !== 4)) return null;
  return { rows, total: m[2].trim(), notice: (m[3] ?? "").trim() };
}

/* 判定三色:行情内=绿、偏高=红、可谈=荧光黄高亮 */
function VerdictCell({ verdict }: { verdict: string }) {
  if (verdict === "行情内")
    return <span className="font-bold text-green-700">✓ {verdict}</span>;
  if (verdict === "偏高")
    return <span className="font-bold text-[#dd0000]">▲ {verdict}</span>;
  if (verdict === "可谈")
    return (
      <span className="font-bold bg-[#ffff00] px-1 border border-black">
        ¥ {verdict}
      </span>
    );
  return <span>{verdict}</span>;
}

/* 传单贴纸:静态旋转,不做动画 */
function Sticker({ children, rotate }: { children: React.ReactNode; rotate: string }) {
  return (
    <span
      className="inline-block bg-[#ffff00] border-2 border-black px-2 py-0.5 text-[12px] font-black"
      style={{ transform: `rotate(${rotate})` }}
    >
      {children}
    </span>
  );
}

export default function Page() {
  const [listing, setListing] = useState(SAMPLE_LISTING);
  const { run, loading, text, error } = useGenerate("chintai");

  const parsed = text ? parseResult(text) : null;

  return (
    <main className={`min-h-dvh px-3 pt-6 pb-6 ${theme.page} ${theme.font}`}>
      <div className="max-w-md mx-auto">
        {/* 传单头:红底大字 + 贴纸 */}
        <div className="border-4 border-black bg-[#dd0000] text-white px-3 py-3 relative">
          <h1 className="text-2xl font-black leading-tight">
            {material.emoji} {material.name}
          </h1>
          <p className="text-[12px] font-bold mt-1">{material.nameJa} · 初期費用、ぜんぶバラします</p>
          <div className="absolute -top-3 -right-1">
            <Sticker rotate="-3deg">注目!</Sticker>
          </div>
        </div>
        <div className="border-4 border-t-0 border-black bg-[#ffff00] px-3 py-2 mb-4 flex items-center justify-between gap-2">
          <span className="text-[13px] font-black">礼金・敷金・謎の手数料…払いすぎてない?</span>
          <Sticker rotate="3deg">敷金0円の罠</Sticker>
        </div>

        {/* ↓ 桌卡坑位①:URL 输入框画出来但禁用(后端 chintai/url_fetch 也是 locked) */}
        <div className="mb-3">
          <label className="block text-[12px] font-bold mb-1">🔗 URLを貼る</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              disabled
              placeholder="https://suumo.jp/…(未対応)"
              className="pit-locked flex-1 border-2 border-black bg-[#eeeeee] px-2 py-2 text-[13px] min-w-0"
            />
            <span className="shrink-0 text-[11px] font-bold border-2 border-black bg-white px-1.5 py-1">
              コピペのみ対応
            </span>
          </div>
        </div>

        {/* 主路径:粘贴房源页文本 */}
        <label className="block text-[12px] font-bold mb-1">📋 物件ページの文字を貼り付け</label>
        <textarea
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          rows={9}
          className="w-full border-4 border-black bg-white px-2 py-2 text-[12px] leading-relaxed mb-3"
        />

        <button
          onClick={() => void run("analyze", { listing })}
          disabled={loading || !listing.trim()}
          className="w-full border-4 border-black bg-[#dd0000] text-white text-lg font-black py-3 disabled:opacity-50"
        >
          {loading ? "計算中…電卓を叩いています🧮" : "初期費用をバラす!"}
        </button>

        {/* ↓ 桌卡坑位②:地域相場比較按钮置灰(后端 chintai/compare 也是 locked) */}
        <button
          disabled
          className="pit-locked w-full border-2 border-black bg-[#eeeeee] text-[13px] font-bold py-2.5 mt-2"
        >
          🔒 地域相場と比較(未対応)
        </button>

        {/* 错误:useGenerate 已翻译成人话,直接渲染 */}
        {error && (
          <div className="mt-4 border-4 border-[#dd0000] bg-white px-3 py-2 text-[13px] font-bold text-[#dd0000]">
            ⚠ {error}
          </div>
        )}

        {/* 结果:能解析就上三色表,解析不了就整段原样贴出来 */}
        {text && (
          <div className="mt-5">
            <div className="border-4 border-black bg-black text-white px-3 py-1.5 text-[14px] font-black">
              ▼ 拆解結果
            </div>
            {parsed ? (
              <>
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#ffff00]">
                      <th className="border-2 border-black px-1.5 py-1 text-left font-black">項目</th>
                      <th className="border-2 border-black px-1.5 py-1 text-left font-black">金額</th>
                      <th className="border-2 border-black px-1.5 py-1 text-left font-black">判定</th>
                      <th className="border-2 border-black px-1.5 py-1 text-left font-black">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((r, i) => (
                      <tr key={i} className="bg-white">
                        <td className="border-2 border-black px-1.5 py-1 font-bold">{r[0]}</td>
                        <td className="border-2 border-black px-1.5 py-1 tabular-nums whitespace-nowrap">{r[1]}</td>
                        <td className="border-2 border-black px-1.5 py-1 whitespace-nowrap">
                          <VerdictCell verdict={r[2]} />
                        </td>
                        <td className="border-2 border-black px-1.5 py-1">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-4 border-black border-t-0 bg-[#ffff00] px-3 py-2">
                  <span className="text-[12px] font-black">💰 合計:</span>
                  <span className="text-[13px] font-bold whitespace-pre-wrap">{parsed.total}</span>
                </div>
                {parsed.notice && (
                  <p className="text-[11px] mt-2 opacity-70 whitespace-pre-wrap">※ {parsed.notice}</p>
                )}
              </>
            ) : (
              /* 格式对不上号:原样裸奔,不崩 */
              <pre className="border-4 border-black border-t-0 bg-white px-3 py-2 text-[12px] whitespace-pre-wrap break-words font-sans">
                {text}
              </pre>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
