// ============================================================
// app/d/eiju/page.tsx — 永住点数计算器 🧮(样板 demo)
// 纯前端实时算分,无 LLM。算分规则在 demos/eiju/rules.ts。
// 这个文件同时是其他 9 个 demo 的结构样板:
//   世界观容器 → 表单 → 结果 → 置灰的坑
// ============================================================
"use client";

import { useState } from "react";
import { calcScore, type EijuInput } from "@/demos/eiju/rules";
import { theme } from "@/demos/eiju/theme";
import { demos } from "@/demos-material";

const material = demos.find((d) => d.slug === "eiju")!;

/* Excel 风的一行:label 在左,控件在右,细黑边框 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 border border-black/60 border-t-0 first:border-t px-3 py-2.5 bg-white">
      <span className="text-[13px] shrink-0">{label}</span>
      {children}
    </label>
  );
}

const selectCls =
  "text-[13px] bg-[#eef3ff] border border-black/40 px-2 py-1 max-w-[55%] text-right";

export default function Page() {
  const [input, setInput] = useState<EijuInput>({
    degree: "master",
    income: 500,
    age: 29,
    career: 3,
    jlpt: "n2",
    jpUniv: false,
    natQual: 0,
    research: false
  });
  const set = <K extends keyof EijuInput>(k: K, v: EijuInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  const r = calcScore(input);
  const goal = r.total >= 80 ? null : r.total >= 70 ? 80 : 70;

  return (
    <main className={`min-h-dvh px-4 pt-8 pb-6 ${theme.page} ${theme.font}`}>
      <div className="max-w-md mx-auto">
        {/* 假 Excel 标题栏,rough 档的世界观 */}
        <div className="border border-black/60 bg-[#dce6f5] px-3 py-1.5 text-[11px] flex justify-between items-center">
          <span>永住ポイント計算機.xlsx</span>
          <span className="opacity-60">閲覧のみ</span>
        </div>
        <div className="border border-black/60 border-t-0 bg-white px-3 py-3 mb-5">
          <h1 className="text-lg font-bold leading-tight">
            {material.emoji} {material.name}
          </h1>
          <p className="text-[11px] opacity-60 mt-0.5">
            高度人材ポイント簡易版 · 規則:2026年8月版(硬编码)
          </p>
          {/* ↓ 桌卡坑位①:政策更新日刻意空白 */}
          <p className="text-[11px] mt-1.5" style={{ color: theme.accent }}>
            政策データ更新日:<span className="inline-block w-20 border-b border-black/70 align-baseline">&nbsp;</span>
          </p>
        </div>

        {/* 表单 */}
        <div className="mb-5">
          <Row label="最終学歴">
            <select
              className={selectCls}
              value={input.degree}
              onChange={(e) => set("degree", e.target.value as EijuInput["degree"])}
            >
              <option value="doctor">博士</option>
              <option value="master">修士</option>
              <option value="bachelor">学士</option>
              <option value="none">その他</option>
            </select>
          </Row>
          <Row label={`年収 ${input.income} 万円`}>
            <input
              type="range"
              min={200}
              max={1200}
              step={50}
              value={input.income}
              onChange={(e) => set("income", Number(e.target.value))}
              className="w-[55%] accent-[#1a56c4]"
            />
          </Row>
          <Row label={`年齢 ${input.age}`}>
            <input
              type="range"
              min={22}
              max={55}
              value={input.age}
              onChange={(e) => set("age", Number(e.target.value))}
              className="w-[55%] accent-[#1a56c4]"
            />
          </Row>
          <Row label={`実務経験 ${input.career} 年`}>
            <input
              type="range"
              min={0}
              max={15}
              value={input.career}
              onChange={(e) => set("career", Number(e.target.value))}
              className="w-[55%] accent-[#1a56c4]"
            />
          </Row>
          <Row label="日本語能力">
            <select
              className={selectCls}
              value={input.jlpt}
              onChange={(e) => set("jlpt", e.target.value as EijuInput["jlpt"])}
            >
              <option value="n1">N1</option>
              <option value="n2">N2</option>
              <option value="none">なし/N3以下</option>
            </select>
          </Row>
          <Row label="日本の大学卒">
            <input
              type="checkbox"
              checked={input.jpUniv}
              onChange={(e) => set("jpUniv", e.target.checked)}
              className="w-4 h-4 accent-[#1a56c4]"
            />
          </Row>
          <Row label="国家資格の数">
            <select
              className={selectCls}
              value={input.natQual}
              onChange={(e) => set("natQual", Number(e.target.value))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2+</option>
            </select>
          </Row>
          <Row label="研究実績(特許/論文)">
            <input
              type="checkbox"
              checked={input.research}
              onChange={(e) => set("research", e.target.checked)}
              className="w-4 h-4 accent-[#1a56c4]"
            />
          </Row>
        </div>

        {/* 分数:巨大数字裸奔 */}
        <div className="border border-black/60 bg-white px-4 py-5 text-center mb-1">
          <div className="text-[80px] leading-none font-bold tabular-nums" style={{ color: theme.accent }}>
            {r.total}
          </div>
          <div className="text-[12px] mt-2 opacity-70">
            {r.total >= 80
              ? "80 点达成:最快 1 年可申请永住"
              : r.total >= 70
                ? "70 点达成:3 年可申请永住 · 距 80 还差 " + (80 - r.total) + " 点"
                : "距 70 点还差 " + (70 - r.total) + " 点"}
          </div>
          {r.warning && (
            <div className="text-[11px] mt-2 text-red-700 border border-red-700 px-2 py-1 inline-block">
              ⚠ {r.warning}
            </div>
          )}
        </div>

        {/* 得分明细 */}
        <table className="w-full text-[12px] border-collapse mb-5">
          <tbody>
            {r.items.map((i) => (
              <tr key={i.label}>
                <td className="border border-black/60 bg-white px-2 py-1">{i.label}</td>
                <td className="border border-black/60 bg-white px-2 py-1 text-right tabular-nums w-14">
                  +{i.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 差距拆解 */}
        {goal && r.boosts.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[13px] font-bold mb-2">▼ 怎么补到 {goal} 点</h2>
            <table className="w-full text-[12px] border-collapse">
              <tbody>
                {r.boosts.slice(0, 5).map((b) => (
                  <tr key={b.label}>
                    <td className="border border-black/60 bg-[#fffbe6] px-2 py-1">{b.label}</td>
                    <td className="border border-black/60 bg-[#fffbe6] px-2 py-1 text-right tabular-nums w-14">
                      +{b.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ↓ 桌卡坑位②:证明材料清单按钮置灰(后端 eiju/evidence_list 也是 locked) */}
        <button disabled className="pit-locked w-full border border-black/60 bg-white py-3 text-[13px]">
          🔒 証明書類チェックリストを生成(未対応)
        </button>

      </div>
    </main>
  );
}
