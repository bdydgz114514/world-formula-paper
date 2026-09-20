#!/usr/bin/env node
// check-flow.mjs —— 「四载体单向流动」闸门
// 规则：素材(知识库) → 论文 → 讲稿 → PPT，禁止反向。
// 任何出现在讲稿里的主张/术语，必须先在论文里存在。
//
// v3（2026-09-21）修复记录：
//   1. 讲稿侧原来只检查 lecture2/讲稿.md（第二期旧稿），而**新的《讲稿-总集》根本没被检查**。
//      现在逐份检查全部讲稿，且《讲稿-总集》是主对象。
//   2. 论文语料原来只有《世界式论文.md》。第 48 号《大一统理论纲要》里的术语
//      （重正化群、渐近安全、记忆项…）会被误判为「论文没有」——现在是两份论文合并成语料。
//   3. 新增出戏词零容忍检查（游戏内/玩家/官方/策划/实装）——原先靠临时脚本，没固化。
//   4. 新增插图引用存在性检查。
//   5. 新增讲稿页码连续性与交叉引用检查（扩写讲稿时最容易漏的就是这两条）。
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const rd = (p) => fs.readFileSync(path.join(HERE, p), "utf8");
const has = (p) => fs.existsSync(path.join(HERE, p));

const PAPERS   = ["世界式论文.md", "大一统理论纲要.md"];
const LECTURES = ["讲稿-总集.md", "lecture2/讲稿.md", "lecture/讲稿.md"];
const OOC      = ["玩家", "游戏内", "官方", "策划", "实装"];

// 人工复核过的「不是术语」的讲稿用语（每次新增都要在这里写一句理由）
const WHITELIST = new Set([
  // 例： "我引入一个量" —— 纯叙述
]);

let fail = 0, warn = 0;
const bad = (s) => { console.log("  ✘ " + s); fail++; };
const soft = (s) => { console.log("  ⚠ " + s); warn++; };

// ---------- 1. 主张台账 ----------
const reg = JSON.parse(rd("主张台账.json"));
const paperText = PAPERS.filter(has).map(rd).join("\n");
const heads = PAPERS.filter(has).flatMap((f) => [...rd(f).matchAll(/^## (.+)$/gm)].map((m) => m[1]));
const secExists = (a) => {
  const base = a.split("·")[0].trim();
  return heads.some((h) => h.startsWith(base));
};
console.log("=== 逐条校验 " + reg.claims.length + " 条主张 ===");
for (const c of reg.claims) {
  const ok = secExists(c.paper);
  const needFalsify = c.direction === "回溯" && c.grade !== "甲级";
  if (!ok) bad(c.id + " [" + c.direction + "/" + c.grade + "] " + c.stmt.slice(0, 34) + "  ← 论文里找不到锚点「" + c.paper + "」");
  else {
    let note = "";
    if (needFalsify && !c.falsify) { note = "  ← 回溯类却无推翻条件"; warn++; }   // 原来只打印不计数，汇总行永远看不到它
    console.log("  OK " + c.id + " [" + c.direction + "/" + c.grade + "] " + c.stmt.slice(0, 34) + note);
  }
}

// ---------- 2. 术语覆盖率（逐份讲稿） ----------
console.log("\n=== 反向检查：讲稿术语在论文里的覆盖率 ===");
const STOP = new Set(["这一期","这个","那个","那么","什么","怎么","为什么","我们","你们","他们",
  "可以","应该","需要","不是","就是","这是","那是","一个","一种","一样","已经","还没",
  "第一","第二","第三","第四","第五","第六","第七","页","讲稿","幻灯片","谢谢","各位","大家"]);
const NARRATION = ["原话是","本文说","评论说","原文说他","原文说","我认为","也就是说","换句话说",
  "第一","第二","第三","第四","第五","第六","第七","对上了","被验证","未核实","有意暗示",
  "推翻条件是","这意味着","这说明","各位","大家","谢谢","讲稿","幻灯片","页","这一期","上一期","这一句话",
  // 以下是人工复核过的讲稿串场用语（不是术语）
  "那些人呢","今天这一小时","停一下"];
const LEC_DENIED = /社区用语|不是原文|搜不到/;
for (const lect of LECTURES) {
  if (!has(lect)) continue;
  const lec = rd(lect);
  const terms = new Map();
  for (const m of lec.matchAll(/[「『]([^」』]{2,14})[」』]/g)) {
    const k = m[1].trim();
    if (!STOP.has(k) && !/^[0-9\s.]+$/.test(k)) terms.set(k, (terms.get(k) || 0) + 1);
  }
  for (const m of lec.matchAll(/[\u4e00-\u9fff]{3,8}/g)) {
    const k = m[0];
    if (!STOP.has(k)) terms.set(k, (terms.get(k) || 0) + 1);
  }
  const lecOnly = [];
  for (const [k, n] of terms) {
    if (n < 3 || k.length < 3) continue;
    if (WHITELIST.has(k)) continue;
    // 含虚词的连续汉字块是叙述句，不是术语（真术语几乎不含「的/了/是/我/这/就」一类字）
    if ([...k].some((c) => "的了是我你他她它们这那和与就也都很不没把被给让对从到会能要个么呢吧啊呀还只更最".includes(c)) && !/死之诅咒|规格|地原胚质|虚假之天/.test(k)) continue;
    if (NARRATION.some((w) => k.includes(w) || w.includes(k))) continue;
    const ctx = lec.slice(Math.max(0, lec.indexOf(k) - 120), lec.indexOf(k) + 120);
    if (LEC_DENIED.test(ctx)) continue;
    if (!paperText.includes(k)) lecOnly.push([k, n]);
  }
  lecOnly.sort((a, b) => b[1] - a[1]);
  if (lecOnly.length) {
    console.log("  " + lect + "：论文完全没提、但讲稿讲了 3 次以上的术语：");
    for (const [k, n] of lecOnly.slice(0, 20)) {
      console.log("    ✘ 「" + k + "」 讲稿 " + n + " 次 / 论文 0 次");
      fail++;
    }
    if (lecOnly.length > 20) console.log("    … 另有 " + (lecOnly.length - 20) + " 条");
  } else {
    console.log("  ✔ " + lect + "：无术语级缺口");
  }
}

// ---------- 3. 出戏词（零容忍） ----------
console.log("\n=== 出戏词检查（零容忍） ===");
let ooc = 0;
for (const f of [...PAPERS, ...LECTURES]) {
  if (!has(f)) continue;
  rd(f).split(/\r?\n/).forEach((L, i) => {
    for (const w of OOC) if (L.includes(w)) { console.log("  ✘ " + f + ":" + (i + 1) + " 出现「" + w + "」"); ooc++; fail++; }
  });
}
if (!ooc) console.log("  ✔ 0 处");

// ---------- 4. 插图引用存在性 ----------
console.log("\n=== 插图引用存在性 ===");
let missImg = 0, imgN = 0;
for (const f of [...PAPERS, ...LECTURES]) {
  if (!has(f)) continue;
  for (const m of rd(f).matchAll(/^!\[.*?\]\((.*?)\)$/gm)) {
    imgN++;
    if (!has(m[1])) { console.log("  ✘ " + f + " 引用了不存在的图：" + m[1]); missImg++; fail++; }
  }
}
console.log(missImg ? "" : "  ✔ " + imgN + " 处引用全部存在");

// ---------- 5. 讲稿页码与交叉引用 ----------
console.log("\n=== 讲稿页码与交叉引用 ===");
for (const f of LECTURES) {
  if (!has(f)) continue;
  const lines = rd(f).split(/\r?\n/);
  const pages = [];
  lines.forEach((L, i) => {
    const m = L.match(/^##\s+第\s*(\d+)\s*页[　 ]*(.*)$/);
    if (m) pages.push({ n: +m[1], title: m[2].trim(), line: i + 1 });
  });
  if (!pages.length) { soft(f + "：没有解析到「第 N 页」标题"); continue; }
  const dupT = {}, titleSeen = {};
  let gap = 0;
  pages.forEach((p, k) => {
    if (p.n !== k + 1) { console.log("  ✘ " + f + " 页码不连续：第 " + (k + 1) + " 个标题是「第 " + p.n + " 页」（" + p.line + " 行）"); gap++; fail++; }
    if (p.title && titleSeen[p.title]) { console.log("  ✘ " + f + " 第 " + p.n + " 页标题「" + p.title + "」与第 " + titleSeen[p.title] + " 页重复"); gap++; fail++; }
    if (p.title) titleSeen[p.title] = p.n;
  });
  // 正文里的交叉引用
  const N = pages.length;
  const byN = new Map(pages.map((p) => [p.n, p.title]));
  let xref = 0;
  lines.forEach((L, i) => {
    if (/^##\s+第\s*\d+\s*页/.test(L)) return;
    for (const m of L.matchAll(/第\s*(\d+)\s*页/g)) {
      const t = +m[1];
      xref++;
      if (t < 1 || t > N) { console.log("  ✘ " + f + ":" + (i + 1) + " 交叉引用「第 " + t + " 页」超出范围（共 " + N + " 页）"); fail++; }
    }
  });
  // 交叉引用逐条列出，供人工复核指向是否正确
  const refs = new Map();
  lines.forEach((L) => {
    if (/^##\s+第\s*\d+\s*页/.test(L)) return;
    for (const m of L.matchAll(/第\s*(\d+)\s*页/g)) refs.set(+m[1], (refs.get(+m[1]) || 0) + 1);
  });
  console.log("  " + f + "：共 " + N + " 页" + (gap ? "" : "，页码连续") + "；交叉引用 " + xref + " 处");
  for (const [t, c] of [...refs].sort((a, b) => a[0] - b[0])) {
    const okRange = t >= 1 && t <= N;
    console.log("    → 第 " + t + " 页（" + (okRange ? byN.get(t) : "不存在") + "）" + (c > 1 ? " ×" + c : ""));
  }
}

// ---------- 6. 简繁混用 ----------
console.log("\n=== 简繁混用检查 ===");
// 只收录「繁体专用」的字，共用字（如 著/为 的简体形）不入表
const TRAD = "個這為說麼條們時會後點與車輛東馬鳥魚島國學習實現發變處務萬億聲書寫讀聽關開門長進來對應樣種經歷據產業圖畫線區環節樂風雲電須將軍醫藥體驗讓議論講話語詞譯釋義檢";
let tradN = 0;
for (const f of [...PAPERS, ...LECTURES]) {
  if (!has(f)) continue;
  rd(f).split(/\r?\n/).forEach((L, i) => {
    const bad = [...new Set([...L].filter((c) => TRAD.includes(c)))];
    if (bad.length) { console.log("  ✘ " + f + ":" + (i + 1) + " 出现繁体字「" + bad.join("") + "」"); tradN++; fail++; }
  });
}
if (!tradN) console.log("  ✔ 全文为简体");

// ---------- 7. 引文保真（只报警告，供人工复核） ----------
console.log("\n=== 引文保真：讲稿里的长引号是否出自两份论文 ===");
const MAIN = "讲稿-总集.md";
if (has(MAIN)) {
  const lec = rd(MAIN);
  const uniq = [...new Set([...lec.matchAll(/「([^」]{10,})」/g)].map((m) => m[1]))];
  // 人工复核过、确认不是「论文没有的新结论」的条目（自述 / 自引 / 转述 / 加粗位置不同）
  const SELFQUOTE = [
    "失去了生长所需之前置条件的世界", "**已经**不会再有新的文明诞生了",
    "**最早填入**『世界式』的**输入值**出现了变动。", "所在的办公室毕竟只有两个人",
    "后一项等于前一项的 a 倍加上前两项的 b 倍", "最早填入的输入值出现了变动",
    "被合并的东西没有回头路", "既然她能回来，那用同样的办法也能把别人带回来。",
    "封闭系统里差别只会减少", "你怎么知道你不是在过拟合？", "你连算式的输入都没填对。",
    "我在讲的时候用的是陈述句，但它们的可信度并不一样", "这两份东西可能互相解释",
    "差别度就是可重正化程度",
  ];
  const notFound = uniq.filter((q) => !paperText.includes(q) && !paperText.includes(q.slice(0, 8)));
  const miss = notFound.filter((q) => !SELFQUOTE.includes(q));
  console.log("  长引号（≥10 字）共 " + uniq.length + " 条：逐字命中论文 " + (uniq.length - notFound.length) +
    " 条，白名单（自述/自引/加粗位置不同）" + (notFound.length - miss.length) + " 条。");
  if (miss.length) {
    console.log("  未复核、且在两份论文里找不到的引号（请人工过一眼）：");
    for (const q of miss) { console.log("    ⚠ " + q.slice(0, 46)); soft(q.slice(0, 30)); }
  } else console.log("  ✔ 无未复核的引文缺口");
}

// ---------- 8. 表格完整性 ----------
// 来历：回溯三那张「变量位时间表」曾被正文截成两段，第二段没有表头分隔行，
// 转网页时表头行被当成正文、第二行被当成表头分隔行而**静默吞掉**。
console.log("\n=== 表格完整性 ===");
let tblN = 0, tblBad = 0;
for (const f of [...PAPERS, ...LECTURES]) {
  if (!has(f)) continue;
  const lines = rd(f).split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (/^\|/.test(lines[i])) {
      const start = i, buf = [];
      while (i < lines.length && /^\|/.test(lines[i])) { buf.push(lines[i]); i++; }
      tblN++;
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").length;
      const widths = [...new Set(buf.map(cells))];
      if (widths.length > 1) { console.log("  ✘ " + f + ":" + (start + 1) + " 表格列数不一致：" + widths.join(" vs ")); tblBad++; fail++; }
      if (!/^\|[\s:\-|]+\|$/.test(buf[1] || "")) { console.log("  ✘ " + f + ":" + (start + 1) + " 表格缺少表头分隔行（第 2、3 行会被吞掉）"); tblBad++; fail++; }
    } else i++;
  }
}
console.log(tblBad ? "  共 " + tblN + " 张表，" + tblBad + " 张有问题" : "  ✔ " + tblN + " 张表全部完整（列数一致 + 有表头分隔行）");

// ---------- 统计 ----------
const dirs = {}, grades = {};
reg.claims.forEach((c) => { dirs[c.direction] = (dirs[c.direction] || 0) + 1; grades[c.grade] = (grades[c.grade] || 0) + 1; });
const falsifiable = reg.claims.filter((c) => c.falsify).length;
console.log("\n=== 台账统计 ===");
console.log("  方向: " + JSON.stringify(dirs) + "　等级: " + JSON.stringify(grades));
console.log("  有推翻条件: " + falsifiable + "/" + reg.claims.length + " (" + Math.round((falsifiable / reg.claims.length) * 100) + "%)");
console.log("  预测类占比: " + Math.round(((dirs["预测"] || 0) / reg.claims.length) * 100) + "%");
console.log("\n" + (fail ? "✘ 硬失败 " + fail + " 条" : "✔ 无硬失败") + (warn ? "　⚠ 警告 " + warn + " 条" : ""));
process.exit(fail ? 1 : 0);
