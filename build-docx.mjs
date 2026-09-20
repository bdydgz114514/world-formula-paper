#!/usr/bin/env node
// build-docx.mjs —— 讲稿 Markdown → Word (.docx)
//
// 用法:  node build-docx.mjs <讲稿.md> ["副标题"]
// 例:    node build-docx.mjs "D:\ai\gongzuoqu\tools\world-formula-paper\讲稿-总集.md"
//
// v2 修复记录（2026-09-21）：
//   1. 页码与正文被正则拆反了 —— 原来 split 只取两个捕获组，parts[i+1] 实际是「标题」、
//      parts[i+2] 实际是「整页正文」，导致 Word 里每页的标题位置显示整页正文、
//      正文位置只剩标题两个字。
//   2. 不解析 **加粗** —— 正文里出现 148 处字面星号。
//   3. 不解析 Markdown 表格 —— 表格退化成竖线文本。
//   4. 封面写死「世界式：原理、推理与应用 / 一 小 时 讲 课 讲 稿」，
//      《讲稿-总集》（五部）用了错的封面；现在封面主标题取自 md 的 H1。
//   5. 每页不加分页符 —— 现在每页另起一页，docx 页数与「第 N 页」一致。
//   6. 新增：部标题单独成页、引用块左边框、列表缩进、行内代码。
import { createRequire } from "node:module";
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const JSZip = require(join(__dirname0(), "node_modules", "jszip"));
function __dirname0() {
  return dirname(fileURLToPath(import.meta.url));
}
const HERE = __dirname0();

const SRC = process.argv[2] || join(HERE, "讲稿.md");
const SUBTITLE = process.argv[3] || "讲 稿";
const md = await fsp.readFile(SRC, "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FONT = "Microsoft YaHei";
const MONO = "Consolas";
const rpr = (o) =>
  '<w:rPr><w:rFonts w:ascii="' + (o.mono ? MONO : FONT) + '" w:hAnsi="' + (o.mono ? MONO : FONT) + '" w:eastAsia="' + FONT + '"/>' +
  (o.b ? "<w:b/>" : "") + (o.i ? "<w:i/>" : "") +
  (o.color ? '<w:color w:val="' + o.color + '"/>' : "") +
  (o.shd ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>' : "") +
  '<w:sz w:val="' + (o.sz || 24) + '"/><w:szCs w:val="' + (o.sz || 24) + '"/></w:rPr>';

// 行内标记：**加粗** 与 `代码`
const inline = (text0, o) => {
  const segs = [];
  const text = text0.replace(/\\\*/g, "\u0001");   // \* 转义：先藏起来，渲染前还原
  const re = /(\*\*[\s\S]+?\*\*|`[^`]+?`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ t: text.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) segs.push({ t: tok.slice(2, -2), b: true });
    else segs.push({ t: tok.slice(1, -1), mono: true, color: "1F5C4D" });
    last = m.index + tok.length;
  }
  if (last < text.length) segs.push({ t: text.slice(last) });
  if (!segs.length) segs.push({ t: "" });
  return segs
    .map((s) => "<w:r>" + rpr(Object.assign({}, o, s)) + '<w:t xml:space="preserve">' + esc(s.t).replace(/\u0001/g, "*") + "</w:t></w:r>")
    .join("");
};

const para = (text, o = {}) =>
  "<w:p><w:pPr>" +
  (o.pb ? "<w:pageBreakBefore/>" : "") +
  '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 110 : o.after) + '" w:line="' + (o.line || 340) + '" w:lineRule="auto"/>' +
  '<w:jc w:val="' + (o.jc || "both") + '"/>' +
  (o.ind ? '<w:ind w:left="' + o.ind + '"/>' : "") +
  (o.border ? '<w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="2A9D8F"/></w:pBdr>' : "") +
  rpr(o) + "</w:pPr>" +
  (text === "" ? "" : inline(text, o)) +
  "</w:p>";

const cell = (text, o = {}) =>
  "<w:tc><w:tcPr><w:tcW w:w=\"0\" w:type=\"auto\"/>" +
  (o.shd ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>' : "") +
  '<w:vAlign w:val="center"/></w:tcPr>' +
  para(text, { sz: 21, jc: "left", after: 30, before: 30, line: 280, b: o.b, color: o.color }) +
  "</w:tc>";

const table = (rows) =>
  '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblLayout w:type="autofit"/><w:tblBorders>' +
  ["top", "left", "bottom", "right", "insideH", "insideV"]
    .map((s) => "<w:" + s + ' w:val="single" w:sz="4" w:space="0" w:color="D5E0E6"/>')
    .join("") +
  "</w:tblBorders></w:tblPr>" +
  rows
    .map((r, ri) =>
      "<w:tr>" + (ri === 0 ? "<w:trPr><w:tblHeader/></w:trPr>" : "") +
      r.map((c) => cell(c, ri === 0 ? { b: true, color: "FFFFFF", shd: "16324F" } : {})).join("") +
      "</w:tr>")
    .join("") +
  "</w:tbl>" + para("", { sz: 6, after: 80 });

// ---------- 切块 ----------
const lines = md.split(/\r?\n/);
const blocks = [];
let pageTitle = "";
let i = 0;
while (i < lines.length) {
  const L = lines[i];
  if (/^\s*$/.test(L)) { i++; continue; }
  let m;
  if ((m = L.match(/^#\s+(.*)$/))) { pageTitle = m[1].trim(); i++; continue; }
  if ((m = L.match(/^###\s+第([一二三四五六七八九十]+)部[　 ]*(.*)$/))) {
    blocks.push({ kind: "part", text: "第" + m[1] + "部　" + m[2] }); i++; continue;
  }
  if ((m = L.match(/^##\s+第\s*(\d+)\s*页[　 ]*(.*)$/))) {
    blocks.push({ kind: "page", n: m[1], title: m[2].trim() }); i++; continue;
  }
  if ((m = L.match(/^(#{2,4})\s+(.*)$/))) { blocks.push({ kind: "head", lv: m[1].length, text: m[2].trim() }); i++; continue; }
  if (/^---+$/.test(L.trim())) { i++; continue; }
  if (/^\|/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\|/.test(lines[i])) { buf.push(lines[i]); i++; }
    const rows = buf
      .filter((r) => !/^\|[\s:\-|]+\|$/.test(r))
      .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    if (rows.length) blocks.push({ kind: "table", rows });
    continue;
  }
  if (/^>\s?/.test(L)) {
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
    blocks.push({ kind: "quote", items: buf }); continue;
  }
  if (/^\s*[-*]\s+/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
    blocks.push({ kind: "ul", items: buf }); continue;
  }
  if (/^\s*\d+\.\s+/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
    blocks.push({ kind: "ol", items: buf }); continue;
  }
  const buf = [];
  while (i < lines.length && !/^\s*$/.test(lines[i]) &&
         !/^#{1,4}\s/.test(lines[i]) && !/^\|/.test(lines[i]) && !/^>/.test(lines[i]) &&
         !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
    buf.push(lines[i]); i++;
  }
  blocks.push({ kind: "p", text: buf.join("") });
}

// ---------- 渲染 ----------
const out = [];
// 封面
out.push(para(pageTitle || "讲稿", { b: true, sz: 52, color: "16324F", jc: "center", before: 3200, after: 240 }));
out.push(para(SUBTITLE, { sz: 26, color: "2A9D8F", jc: "center", after: 260 }));
out.push(para("枫丹科学院非常规现象研究室", { sz: 20, color: "5B6B7C", jc: "center", after: 120 }));
const nPages = blocks.filter((b) => b.kind === "page").length;
const nParts = blocks.filter((b) => b.kind === "part").length;
out.push(para(nParts + " 部　" + nPages + " 页", { sz: 18, color: "8A9AA5", jc: "center", before: 160 }));

let curPart = "";
let firstPage = true;
for (const b of blocks) {
  if (b.kind === "part") {
    curPart = b.text;
    out.push(para("", { pb: true, sz: 12, after: 0 }));
    out.push(para(b.text, { b: true, sz: 44, color: "16324F", jc: "center", before: 3000, after: 200 }));
    out.push(para("", { jc: "center", sz: 20, after: 0 }));
    firstPage = true;
    continue;
  }
  if (b.kind === "page") {
    out.push(para("第 " + b.n + " 页" + (b.title ? "　" + b.title : ""), {
      b: true, sz: 32, color: "16324F", before: firstPage ? 260 : 200, after: 170, pb: !firstPage, jc: "left",
    }));
    firstPage = false;
    continue;
  }
  if (b.kind === "head") {
    out.push(para(b.text, { b: true, sz: b.lv === 2 ? 30 : 26, color: "2A9D8F", before: 220, after: 140, jc: "left" }));
    continue;
  }
  if (b.kind === "table") { out.push(table(b.rows)); continue; }
  if (b.kind === "quote") {
    for (const q of b.items) out.push(para(q, { sz: 23, color: "25505F", ind: 420, border: true, after: 90, line: 320 }));
    continue;
  }
  if (b.kind === "ul") {
    for (const it of b.items) out.push(para("· " + it, { sz: 24, ind: 360, after: 80, line: 320 }));
    continue;
  }
  if (b.kind === "ol") {
    b.items.forEach((it, k) => out.push(para((k + 1) + ". " + it, { sz: 24, ind: 360, after: 80, line: 320 })));
    continue;
  }
  out.push(para(b.text, { sz: 24, color: "1B2A41", after: 130, line: 360 }));
}

const doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
  out.join("") +
  '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418"/></w:sectPr>' +
  "</w:body></w:document>";

const zip = new JSZip();
zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  "</Types>");
zip.folder("_rels").file(".rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
  "</Relationships>");
zip.folder("word").file("document.xml", doc);
const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
const OUT = SRC.replace(/\.md$/, ".docx");
await fsp.writeFile(OUT, buf);
console.log(OUT + " 已生成，" + Math.round(buf.length / 1024) + " KB，" + nParts + " 部 " + nPages + " 页");
