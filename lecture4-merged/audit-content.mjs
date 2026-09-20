// audit-content.mjs —— 内容溯源自检：课件上的每一句文字，都必须能在《世界式与大一统-合订本.md》里找到出处片段。
// 另查禁用词（不得出现出戏词：游戏内、玩家、官方、策划、实装）。
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const paper = await fsp.readFile(join(HERE, "..", "世界式与大一统-合订本.md"), "utf8");
const notes = JSON.parse(await fsp.readFile(join(HERE, "notes.json"), "utf8"));
const norm = (s) => s.replace(/[\s\u3000`]/g, "").replace(/[（）()「」《》【】]/g, "");
const P = norm(paper);
function lcs(a) {
  const s = norm(a);
  if (!s) return 0;
  let lo = 0, hi = s.length;
  const ok = (L) => { if (L === 0) return true;
    for (let i = 0; i + L <= s.length; i++) if (P.includes(s.slice(i, i + L))) return true;
    return false; };
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (ok(mid)) lo = mid; else hi = mid - 1; }
  return lo;
}
const BAN = ["游戏内", "玩家", "官方", "策划", "实装"];
let bad = 0, weak = 0, total = 0;
const weakList = [];
for (const p of notes) {
  for (const line of p.lines) {
    total++;
    for (const b of BAN) if (line.includes(b)) { console.log("[禁用词] 第 " + p.n + " 页：" + b + " —— " + line.slice(0, 30)); bad++; }
    if (line.length < 6) continue;
    const L = lcs(line);
    if (L < 8) { weakList.push({ n: p.n, L, line }); weak++; }
  }
}
console.log("检查 " + total + " 条页面文字；禁用词命中 " + bad + " 处；溯源最长相符不足 8 字的 " + weak + " 条：");
for (const w of weakList) console.log("  [第 " + w.n + " 页][最长相符 " + w.L + " 字] " + w.line);
process.exitCode = (bad || weak) ? 1 : 0;
