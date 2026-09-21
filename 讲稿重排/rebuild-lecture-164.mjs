#!/usr/bin/env node
// rebuild-lecture-164.mjs —— 把 450 页的旧讲稿重排成「与课件逐页对应」的 164 页讲稿。
//
// 为什么存在这个脚本：讲稿（450 页）与课件（164 页）原先各写各的，页号对不上。
// 现在讲稿第 N 页 = 课件第 N 页。映射由 _merge/讲稿164-映射.json 固化，可重放。
//
// 用法： node _merge/rebuild-lecture-164.mjs
import fs from "node:fs/promises";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const ROOT = path.join(HERE, "..");
const MAP = JSON.parse(await fs.readFile(path.join(HERE, "讲稿164-映射.json"), "utf8"));
const SRC = await fs.readFile(path.join(HERE, "讲稿-合订本-v1-450页.md"), "utf8");
const heads = MAP.deckHeads;
const newOf = new Map();
MAP.cover.forEach((c, j) => c.forEach((n) => newOf.set(n, j + 1)));

// 切出旧页
const pages = new Map();
for (const chunk of SRC.split(/\n(?=## 第 \d+ 页)/)) {
  const m = chunk.match(/^## 第 (\d+) 页[　\s]*(.*)$/m);
  if (!m) continue;
  const body = chunk.slice(m.index + m[0].length).replace(/\n---\s*$/g, "").replace(/\n---\n/g, "\n")
    .replace(/^###\s*第[一二三]部.*$\n?/gm, "").replace(/^###\s*尾声\s*$\n?/gm, "").trim();
  pages.set(+m[1], { title: m[2].trim(), body });
}
// 正文里的「第 N 页」按新页号重编
const renum = (s) => s.replace(/第\s*(\d+)\s*页/g, (all, d) => (newOf.has(+d) ? all.replace(d, String(newOf.get(+d))) : all));
const out = ["# 世界式与大一统·讲稿", "", "### ——合订本（内部研究纪要第 49 号）讲稿", "",
  "### 与课件逐页对应：讲稿第 N 页 = 课件第 N 页，共 164 页", "",
  "这一版讲稿按课件《世界式-大一统-合订本课件》重排：**讲稿第 N 页就是课件第 N 页**，两份材料可以并排翻。", "",
  "每一页开头那一行是课件上的标题；页内的三级小标题，是重排前每一个小节的原标题（原页码已并入本页）。", ""];
const VOL = new Map([[1, "### 序"], [7, "### 第一部　世界式：一个封闭系统的算术"],
  [75, "### 第二部　大一统：一个缺失的项"], [119, "### 第三部　接缝：两份材料互相解释"], [163, "### 尾声"]]);
for (let j = 0; j < heads.length; j++) {
  const n = j + 1;
  if (VOL.has(n)) out.push("", VOL.get(n), "");
  out.push(`## 第 ${n} 页　${heads[j].head}`);
  if (heads[j].sub) out.push("", "> " + heads[j].sub);
  out.push("");
  for (const old of MAP.cover[j]) { const p = pages.get(old); if (!p) throw new Error("缺页 " + old); out.push("#### " + p.title, "", renum(p.body).trim(), ""); }
  if (n < heads.length) out.push("---", "");
}
let text = out.join("\n").replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";
for (const [a, b] of MAP.fixes) { if (!text.includes(a)) throw new Error("待改写的句子找不到：" + a); text = text.replace(a, b); }
await fs.writeFile(path.join(ROOT, "讲稿-合订本.md"), text, "utf8");
const nPage = (text.match(/^## 第 \d+ 页/gm) || []).length;
console.log(`讲稿-合订本.md 已重建：${nPage} 页，${(text.match(/[\u4e00-\u9fa5]/g) || []).length} 汉字`);
