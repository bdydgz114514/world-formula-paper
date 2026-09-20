import { promises as fsp } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || "世界式论文.md";
const OUT = SRC.replace(/\.md$/, ".html");
let md = await fsp.readFile(join(HERE, SRC), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// 行内标记：**加粗**、*斜体*，以及 \* 转义（原文用 W\* 表示带星号的不动点，
// 转义符必须先藏起来，否则「D\* = 0 改成 D\* = 5」这种一行两个星号会被当成斜体）
const inl = (s) => esc(s)
  .replace(/\\\*/g, "\u0001")
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
  .replace(/\u0001/g, "*");

const lines = md.split(/\r?\n/);
const out = [];
let i = 0, toc = [];
const slug = (s) => "s" + Buffer.from(s).toString("hex").slice(0, 16);
const flushTable = (buf) => {
  if (buf.length < 2) return "";
  const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
  const head = cells(buf[0]);
  const body = buf.slice(2).map(cells);
  return "<table><thead><tr>" + head.map(c => "<th>" + inl(c) + "</th>").join("") + "</tr></thead><tbody>" +
    body.map(r => "<tr>" + r.map(c => "<td>" + inl(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
};
while (i < lines.length) {
  const L = lines[i];
  if (/^\s*$/.test(L)) { i++; continue; }
  const img = L.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (img) {
    const p = join(HERE, img[2]);
    try {
      const b64 = (await fsp.readFile(p)).toString("base64");
      out.push('<figure><img alt="' + esc(img[1]) + '" src="data:image/png;base64,' + b64 + '"></figure>');
    } catch (e) { out.push('<p class="miss">[缺图 ' + esc(img[2]) + ']</p>'); }
    i++; continue;
  }
  if (/^\|/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\|/.test(lines[i])) { buf.push(lines[i]); i++; }
    out.push(flushTable(buf)); continue;
  }
  let m;
  if ((m = L.match(/^(#{1,4})\s+(.*)$/))) {
    const lv = m[1].length, txt = m[2].trim();
    const id = slug(txt);
    if (lv === 2) toc.push({ id, txt });
    out.push("<h" + lv + ' id="' + id + '">' + inl(txt) + "</h" + lv + ">");
    i++; continue;
  }
  if (/^---+$/.test(L.trim())) { out.push("<hr>"); i++; continue; }
  if (/^>\s?/.test(L)) {
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
    out.push("<blockquote>" + buf.map(b => "<p>" + inl(b) + "</p>").join("") + "</blockquote>"); continue;
  }
  if (/^\s*[-*]\s+/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
    out.push("<ul>" + buf.map(b => "<li>" + inl(b) + "</li>").join("") + "</ul>"); continue;
  }
  if (/^\s*\d+\.\s+/.test(L)) {
    const buf = [];
    while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
    out.push("<ol>" + buf.map(b => "<li>" + inl(b) + "</li>").join("") + "</ol>"); continue;
  }
  if (/^\*图/.test(L) || /^\*.+\*$/.test(L)) { out.push('<p class="cap">' + inl(L.replace(/^\*|\*$/g, "")) + "</p>"); i++; continue; }
  out.push("<p>" + inl(L) + "</p>"); i++;
}

const css = [
  ":root{--navy:#16324F;--teal:#2A9D8F;--gold:#C9A227;--grey:#5C6B73}",
  "*{box-sizing:border-box}",
  "body{margin:0;background:#F7FAFC;color:#1B2A33;font-family:'Microsoft YaHei','PingFang SC',system-ui,sans-serif;line-height:1.95;font-size:16.5px}",
  ".wrap{max-width:900px;margin:0 auto;padding:56px 30px 120px;background:#fff;box-shadow:0 0 40px rgba(22,50,79,.08)}",
  "h1{font-size:31px;color:var(--navy);line-height:1.45;margin:0 0 6px;letter-spacing:.5px}",
  "h2{font-size:23px;color:var(--navy);margin:56px 0 16px;padding-bottom:9px;border-bottom:2px solid #E3EBF0}",
  "h3{font-size:18.5px;color:var(--teal);margin:34px 0 12px}",
  "h4{font-size:16.5px;color:var(--grey);margin:24px 0 10px}",
  "p{margin:13px 0}",
  "strong{color:var(--navy)}",
  "blockquote{margin:18px 0;padding:12px 20px;background:#F2F8FA;border-left:4px solid var(--teal);color:#22343F}",
  "blockquote p{margin:6px 0}",
  "table{border-collapse:collapse;width:100%;margin:20px 0;font-size:14.6px}",
  "th{background:var(--navy);color:#fff;text-align:left;padding:9px 11px;font-weight:600}",
  "td{padding:8px 11px;border-bottom:1px solid #E6EDF1;vertical-align:top}",
  "tr:nth-child(even) td{background:#FAFCFD}",
  "figure{margin:26px 0;text-align:center}",
  "figure img{max-width:100%;border:1px solid #E3EBF0;border-radius:7px;background:#fff}",
  ".cap{text-align:center;color:var(--grey);font-size:13.6px;margin:-12px 0 26px}",
  "hr{border:none;border-top:1px solid #E3EBF0;margin:44px 0}",
  "ul,ol{margin:12px 0;padding-left:26px} li{margin:7px 0}",
  ".meta{background:linear-gradient(135deg,#16324F,#2A6E8F);color:#DCEAF2;padding:24px 30px;border-radius:10px;margin:24px 0 34px;font-size:14.6px;line-height:1.9}",
  ".meta strong{color:#fff}",
  ".miss{color:#A63A50}",
  "@media print{body{background:#fff}.wrap{box-shadow:none;max-width:none}h2{page-break-after:avoid}figure{page-break-inside:avoid}}",
].join("\n");
// 标题取 md 的一级标题，取不到才退回默认值（原先是写死的「世界式：原理、推理与应用」）
const h1 = (md.match(/^#\s+(.+)$/m) || [])[1] || "世界式：原理、推理与应用";
const html = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>" + esc(h1) + "</title>\n<style>\n" + css + "\n</style>\n</head>\n<body>\n<div class=\"wrap\">\n" + out.join("\n") + "\n</div>\n</body>\n</html>\n";
await fsp.writeFile(join(HERE, OUT), html, "utf8");
console.log(SRC + " → " + OUT + " 生成完毕: " + Math.round(html.length / 1024) + " KB");
