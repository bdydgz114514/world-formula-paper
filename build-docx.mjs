import { createRequire } from "node:module";
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const JSZip = require("./node_modules/jszip");
const HERE = dirname(fileURLToPath(import.meta.url));

const md = await fsp.readFile(process.argv[2] || join(HERE, "讲稿.md"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FONT = 'Microsoft YaHei';
const rpr = (o) => '<w:rPr><w:rFonts w:ascii="' + FONT + '" w:hAnsi="' + FONT + '" w:eastAsia="' + FONT + '"/>'
  + (o.b ? "<w:b/>" : "") + (o.color ? '<w:color w:val="' + o.color + '"/>' : "")
  + '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/></w:rPr>';
const para = (text, o = {}) => '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after || 100) + '" w:line="' + (o.line || 340) + '" w:lineRule="auto"/>'
  + '<w:jc w:val="' + (o.jc || "both") + '"/>' + rpr(o) + "</w:pPr>"
  + (text ? "<w:r>" + rpr(o) + '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r>" : "") + "</w:p>";

const out = [];
// 封面
out.push(para("世界式：原理、推理与应用", { b: true, sz: 44, color: "16324F", jc: "center", before: 3600, after: 200 }));
out.push(para("一 小 时 讲 课 讲 稿", { sz: 26, color: "2A9D8F", jc: "center", after: 200 }));
out.push(para("枫丹科学院非常规现象研究室", { sz: 20, color: "5B6B7C", jc: "center", after: 120 }));
out.push(para("", { after: 0 }));
out.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');

const parts = md.split(/^## 第 (\d+) 页[　 ]*(.*)$/m);
for (let i = 1; i < parts.length; i += 2) {
  const n = parts[i];
  const body = parts[i + 1].split("\n---")[0].trim();
  const ttl = (parts[i + 2] || "").trim();
  out.push(para("第 " + n + " 页" + (ttl ? "　" + ttl : ""), { b: true, sz: 34, color: "16324F", before: 260, after: 160 }));
  for (const line of body.split("\n").map(s => s.trim()).filter(Boolean)) {
    out.push(para(line, { sz: 24, color: "1B2A41", after: 130, line: 360 }));
  }
}
const doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
  + out.join("")
  + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418"/></w:sectPr>'
  + "</w:body></w:document>";

const zip = new JSZip();
zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  + '<Default Extension="xml" ContentType="application/xml"/>'
  + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
  + "</Types>");
zip.folder("_rels").file(".rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
  + "</Relationships>");
zip.folder("word").file("document.xml", doc);
const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
await fsp.writeFile((process.argv[2] || join(HERE, "讲稿.md")).replace(/\.md$/, ".docx"), buf);
console.log("讲稿.docx 已生成，" + Math.round(buf.length / 1024) + " KB，" + ((parts.length - 1) / 3) + " 页讲稿");
