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
// 反向检查：讲稿里出现、论文里没有的「主张样」句子
console.log("\n=== 反向检查：讲稿里有无论文没有的断言 ===");
const lecClaims = lec.split("\n").filter(l => /^(也就是说|这说明|所以|因此|结论|这意味着)/.test(l.trim()) && l.trim().length > 14);
let orphan = 0;
for (const l of lecClaims) {
  const key = l.replace(/[，。、；：「」（）\s]/g, "").slice(0, 12);
  if (key && !paper.replace(/[，。、；：「」（）\s]/g, "").includes(key.slice(0, 8))) { orphan++; console.log("  ? " + l.trim().slice(0, 76)); }
}
console.log("  可疑行 " + orphan + " 条（需人工确认，非硬失败）");
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
