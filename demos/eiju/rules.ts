// ============================================================
// demos/eiju/rules.ts — 高度人才点数规则(2026年8月版,硬编码)
// 【这就是桌卡的灵魂坑】政策一年一变,这张表谁来维护?
// 「政策データ更新日」字段在页面上刻意留白,不要填。
// 简化说明:采用高度専門・技術分野的主干项目,精简了部分特殊加分,
// 结果仅供参考,不代替行政书士。
// ============================================================

export interface EijuInput {
  degree: "doctor" | "master" | "bachelor" | "none";
  income: number; // 年收,万円
  age: number;
  career: number; // 实务年数
  jlpt: "n1" | "n2" | "none";
  jpUniv: boolean; // 日本大学毕业
  natQual: number; // 国家资格数量(0-2)
  research: boolean; // 研究实绩(专利/论文)
}

export interface ScoreItem {
  label: string;
  points: number;
}

export interface EijuResult {
  total: number;
  items: ScoreItem[];
  warning: string | null;
  /** 距 70/80 的差距拆解:每项还能怎么补 */
  boosts: ScoreItem[];
}

export function calcScore(input: EijuInput): EijuResult {
  const items: ScoreItem[] = [];
  let warning: string | null = null;

  // 学历
  const degreePts = { doctor: 30, master: 20, bachelor: 10, none: 0 }[input.degree];
  if (degreePts) items.push({ label: "学历", points: degreePts });

  // 年收 × 年龄(年收档位随年龄收紧;300 万以下不满足最低线)
  if (input.income < 300) {
    warning = "年收低于 300 万円,不满足高度人才最低年收线,以下分数仅供娱乐";
  }
  let incomePts = 0;
  if (input.income >= 1000) incomePts = 40;
  else if (input.income >= 900) incomePts = 35;
  else if (input.income >= 800) incomePts = 30;
  else if (input.income >= 700 && input.age < 40) incomePts = 25;
  else if (input.income >= 600 && input.age < 35) incomePts = 20;
  else if (input.income >= 500 && input.age < 30) incomePts = 15;
  else if (input.income >= 400 && input.age < 30) incomePts = 10;
  if (incomePts) items.push({ label: "年收", points: incomePts });

  // 年龄
  const agePts = input.age < 30 ? 15 : input.age < 35 ? 10 : input.age < 40 ? 5 : 0;
  if (agePts) items.push({ label: "年龄", points: agePts });

  // 職歴
  const careerPts =
    input.career >= 10 ? 20 : input.career >= 7 ? 15 : input.career >= 5 ? 10 : input.career >= 3 ? 5 : 0;
  if (careerPts) items.push({ label: "実務経験", points: careerPts });

  // 加分项
  if (input.jlpt === "n1") items.push({ label: "日本語 N1", points: 15 });
  if (input.jlpt === "n2") items.push({ label: "日本語 N2", points: 10 });
  if (input.jpUniv) items.push({ label: "日本の大学卒", points: 10 });
  const qualPts = Math.min(input.natQual, 2) * 5;
  if (qualPts) items.push({ label: "国家資格", points: qualPts });
  if (input.research) items.push({ label: "研究実績", points: 15 });

  const total = items.reduce((s, i) => s + i.points, 0);

  // 差距拆解:每项还能怎么补(只列当前没拿满的)
  const boosts: ScoreItem[] = [];
  if (input.jlpt === "none") boosts.push({ label: "考过 JLPT N1", points: 15 });
  if (input.jlpt === "n2") boosts.push({ label: "N2 升级到 N1", points: 5 });
  if (input.degree === "bachelor") boosts.push({ label: "读个修士", points: 10 });
  if (input.degree === "master") boosts.push({ label: "读个博士", points: 10 });
  if (!input.jpUniv) boosts.push({ label: "(下辈子)从日本大学毕业", points: 10 });
  if (input.natQual < 2) boosts.push({ label: `再考 ${2 - Math.min(input.natQual, 2)} 个国家資格`, points: (2 - Math.min(input.natQual, 2)) * 5 });
  if (!input.research) boosts.push({ label: "发论文 3 本或专利 1 件", points: 15 });
  if (incomePts < 40) {
    const next =
      input.income >= 900 ? 1000 : input.income >= 800 ? 900 : input.income >= 700 ? 800 : input.income >= 600 ? 700 : input.income >= 500 ? 600 : 500;
    boosts.push({ label: `年收提到 ${next} 万`, points: 5 });
  }
  if (careerPts < 20) boosts.push({ label: "熬工龄到下一档", points: 5 });
  boosts.sort((a, b) => b.points - a.points);

  return { total, items, warning, boosts };
}
