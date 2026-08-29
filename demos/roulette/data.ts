// ============================================================
// demos/roulette/data.ts — 赤坂午饭轮盘的店铺库(硬编码 20 家)
// 真实连锁 + 通用类型名混排;只有 name/genre/walkMin 三个字段,
// 不放地址不放详情——「自動取得」是桌卡上的坑,这里就是手動入力。
// walkMin 为赤坂站周边的粗略步行估值(分)。
// ============================================================

export interface Shop {
  name: string;
  genre: string;
  walkMin: number;
}

export const SHOPS: Shop[] = [
  { name: "大戸屋", genre: "定食", walkMin: 3 },
  { name: "やよい軒", genre: "定食", walkMin: 4 },
  { name: "松屋", genre: "定食", walkMin: 2 },
  { name: "すき家", genre: "丼もの", walkMin: 3 },
  { name: "吉野家", genre: "丼もの", walkMin: 4 },
  { name: "CoCo壱番屋", genre: "カレー", walkMin: 2 },
  { name: "欧風カレーの老舗", genre: "カレー", walkMin: 6 },
  { name: "天下一品", genre: "ラーメン", walkMin: 5 },
  { name: "家系ラーメンの店", genre: "ラーメン", walkMin: 6 },
  { name: "博多とんこつの店", genre: "ラーメン", walkMin: 7 },
  { name: "富士そば", genre: "そば・うどん", walkMin: 1 },
  { name: "讃岐うどんの店", genre: "そば・うどん", walkMin: 5 },
  { name: "日高屋", genre: "中華", walkMin: 2 },
  { name: "リンガーハット", genre: "中華", walkMin: 6 },
  { name: "赤坂の町中華", genre: "中華", walkMin: 5 },
  { name: "立ち食い寿司", genre: "寿司", walkMin: 4 },
  { name: "老舗の寿司ランチ", genre: "寿司", walkMin: 8 },
  { name: "サイゼリヤ", genre: "イタリアン", walkMin: 3 },
  { name: "路地裏のパスタ屋", genre: "イタリアン", walkMin: 7 },
  { name: "喫茶店のナポリタン", genre: "カフェ飯", walkMin: 5 }
];
