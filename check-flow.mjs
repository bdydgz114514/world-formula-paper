#!/usr/bin/env node
// check-flow.mjs —— 「四载体单向流动」闸门
// 规则：素材(知识库) → 论文 → 讲稿 → PPT，禁止反向。
// 任何出现在讲稿/PPT 的主张，必须先在论文里存在。
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const PAPER = path.join(HERE, "世界式论文.md");
const LEC   = path.join(HERE, "lecture2", "讲稿.md");
const reg   = JSON.parse(fs.readFileSync(path.join(HERE, "主张台账.json"), "utf8"));
const paper = fs.readFileSync(PAPER, "utf8");
const lec   = fs.readFileSync(LEC, "utf8");

const heads = [...paper.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const secExists = (a) => {
  const base = a.split("·")[0].trim();
  return heads.some(h => h.startsWith(base));
};
let fail = 0, warn = 0;
console.log("=== 逐条校验 " + reg.claims.length + " 条主张 ===");
for (const c of reg.claims) {
  const ok = secExists(c.paper);
  const hasFalsify = !!c.falsify;
  const needFalsify = c.direction === "回溯" && c.grade !== "甲级";
  let mark = ok ? "OK " : "✘  ";
  if (!ok) fail++;
  let note = "";
  if (!ok) note = "  ← 论文里找不到锚点「" + c.paper + "」";
  else if (needFalsify && !hasFalsify) { note = "  ← 回溯类却无推翻条件"; warn++; }
  console.log("  " + mark + c.id + " [" + c.direction + "/" + c.grade + "] " + c.stmt.slice(0, 34) + note);
}
// 反向检查（v2）：术语覆盖率
// 旧版只看「以特定词开头的行」，漏掉了术语级缺口（例如「死之诅咒」在讲稿出现 7 次、
// 论文 0 次却未被发现）。新版改为：抽取术语，比对论文覆盖率。
console.log("\n=== 反向检查：讲稿术语在论文里的覆盖率 ===");
const STOP = new Set(["这一期","这个","那个","那么","什么","怎么","为什么","我们","你们","他们",
  "可以","应该","需要","不是","就是","这是","那是","一个","一种","一样","已经","还没",
  "第一","第二","第三","第四","第五","第六","第七","页","讲稿","幻灯片","谢谢","各位","大家"]);
const terms = new Map();
// 1) 引号里的短语（专有名词与术语最常出现在这里）
for (const m of lec.matchAll(/[「『]([^」』]{2,14})[」』]/g)) {
  const k = m[1].trim();
  if (!STOP.has(k) && !/^[0-9\s.]+$/.test(k)) terms.set(k, (terms.get(k)||0)+1);
}
// 2) 连续汉字块中出现三次以上的专名候选（长度 3-8）
for (const m of lec.matchAll(/[\u4e00-\u9fff]{3,8}/g)) {
  const k = m[0];
  if (!STOP.has(k)) terms.set(k, (terms.get(k)||0)+1);
}

// 讲稿的叙述性用语（不是术语，不该要求论文收录）
const NARRATION = ["原话是","本文说","评论说","原文说他","原文说","我认为","也就是说","换句话说",
  "第一","第二","第三","第四","第五","第六","第七","对上了","被验证","未核实","有意暗示",
  "推翻条件是","这意味着","这说明","各位","大家","谢谢","讲稿","幻灯片","页","这一期","上一期","这一句话"];
// 讲稿自己声明「不是原文措辞」的词（论文不该收录）
const LEC_DENIED = /社区用语|不是原文|搜不到/;

const lecOnly = [];
for (const [k, n] of terms) {
  if (n < 3) continue;                      // 讲稿里至少出现 3 次才算「在讲」
  if (k.length < 3) continue;
  if (NARRATION.some(w => k.includes(w) || w.includes(k))) continue;   // 叙述词
  // 讲稿自己声明「非原文」的词，跳过
  const ctx = lec.slice(Math.max(0, lec.indexOf(k) - 120), lec.indexOf(k) + 120);
  if (LEC_DENIED.test(ctx)) continue;
  if (!paper.includes(k)) lecOnly.push([k, n]);   // 论文里一次都没有
}
lecOnly.sort((a,b) => b[1]-a[1]);
if (lecOnly.length) {
  console.log("  论文完全没提、但讲稿讲了 3 次以上的术语：");
  for (const [k, n] of lecOnly.slice(0, 20)) console.log("    ✘ 「" + k + "」 讲稿 " + n + " 次 / 论文 0 次");
  fail += lecOnly.length;                    // ← 现在是硬失败
  console.log("  （× 这些是硬失败：单向流动被破坏）");
} else {
  console.log("  ✔ 无术语级缺口");
}
// 统计
const dirs = {}, grades = {};
reg.claims.forEach(c => { dirs[c.direction] = (dirs[c.direction]||0)+1; grades[c.grade] = (grades[c.grade]||0)+1; });
const falsifiable = reg.claims.filter(c => c.falsify).length;
console.log("\n=== 台账统计 ===");
console.log("  方向: " + JSON.stringify(dirs) + "　等级: " + JSON.stringify(grades));
console.log("  有推翻条件: " + falsifiable + "/" + reg.claims.length + " (" + Math.round(falsifiable/reg.claims.length*100) + "%)");
console.log("  预测类占比: " + Math.round((dirs["预测"]||0)/reg.claims.length*100) + "%");
console.log("\n" + (fail ? "✘ 硬失败 " + fail + " 条" : "✔ 无硬失败") + (warn ? "　⚠ 警告 " + warn + " 条" : ""));
process.exit(fail ? 1 : 0);
