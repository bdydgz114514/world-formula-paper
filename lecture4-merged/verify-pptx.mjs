// verify-pptx.mjs —— 校验课件：页数、放映顺序、备注对齐
// 来历：build-pptx.mjs 曾用默认 .sort()（字典序），page-100 排到 page-11 前面，
//       164 页里有 154 页的放映顺序是错的，而页数、备注数、文件数全部显示正常。
// 用法：node verify-pptx.mjs [pptx 路径]
import { createRequire } from "node:module";
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const require_ = createRequire(import.meta.url);
const JSZip = require_(join(HERE, "..", "lecture2", "node_modules", "jszip"));
const file = process.argv[2] || join(HERE, "世界式-大一统-合订本课件.pptx");
const z = await JSZip.loadAsync(await fsp.readFile(file));
const slides = Object.keys(z.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).length;
const notes = Object.keys(z.files).filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f)).length;
const pres = await z.file("ppt/presentation.xml").async("string");
const rels = await z.file("ppt/_rels/presentation.xml.rels").async("string");
const map = {};
for (const m of rels.matchAll(/Id="(rId\d+)"[^>]*Target="slides\/(slide\d+\.xml)"/g)) map[m[1]] = m[2];
const order = [...pres.matchAll(/<p:sldId[^>]*r:id="(rId\d+)"[^>]*\/>/g)].map((m) => map[m[1]]);
let ok = 0; const bad = []; let noNote = 0;
for (let i = 0; i < order.length; i++) {
  const n = order[i].match(/slide(\d+)/)[1];
  const rel = await z.file("ppt/slides/_rels/slide" + n + ".xml.rels").async("string");
  const m = rel.match(/notesSlide(\d+)\.xml/);
  if (!m) { noNote++; continue; }
  const t = await z.file("ppt/notesSlides/notesSlide" + m[1] + ".xml").async("string");
  const plain = [...t.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((x) => x[1]).join("");
  const d = plain.match(/【第\s*(\d+)\s*页/);
  if (d && +d[1] === i + 1) ok++; else bad.push("第 " + (i + 1) + " 张 → 备注自称第 " + (d ? d[1] : "?") + " 页");
}
console.log("幻灯片 " + slides + " 张 | 备注 " + notes + " 份 | 放映顺序条目 " + order.length);
console.log("页序与备注对齐：" + ok + "/" + order.length + (noNote ? "（无备注 " + noNote + "）" : ""));
if (bad.length) { bad.slice(0, 8).forEach((b) => console.log("  ✘ " + b)); process.exit(1); }
console.log("✔ 通过");
