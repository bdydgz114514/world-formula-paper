import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const paper = await fsp.readFile(join(HERE, "..", "世界式与大一统-合订本.md"), "utf8");
const notes = JSON.parse(await fsp.readFile(join(HERE, "notes.json"), "utf8"));
const strip = (s) => s.replace(/[\s\u3000*…`]/g, "").replace(/[（）()「」《》【】『』]/g, "");
const P = strip(paper);
const all = [];
for (const p of notes) for (const l of p.lines) all.push({ n: p.n, s: l });
const quotes = new Set();
for (const x of all) for (const m of x.s.matchAll(/「([^」]+)」/g)) if (m[1].length >= 4) quotes.add(m[1]);
const qBad = [...quotes].filter(q => !P.includes(strip(q)));
console.log("引号片段 " + quotes.size + " 条，原文（去空白与 markdown 标记后）找不到的 " + qBad.length + " 条：");
for (const q of qBad) console.log("   " + q);
const nums = new Set();
for (const x of all) for (const m of x.s.match(/\d+(?:\.\d+)?/g) || []) nums.add(m);
const numBad = [...nums].filter(v => !P.includes(v));
console.log("数字串 " + nums.size + " 个，原文找不到的 " + numBad.length + " 个：" + numBad.join(" | "));
function lcs(a) {
  const s = strip(a); if (!s) return 0;
  let lo = 0, hi = s.length;
  const ok = (L) => { if (L === 0) return true; for (let i = 0; i + L <= s.length; i++) if (P.includes(s.slice(i, i + L))) return true; return false; };
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (ok(mid)) lo = mid; else hi = mid - 1; }
  return lo;
}
const long = all.filter(x => strip(x.s).length >= 12);
const weak = long.filter(x => lcs(x.s) < 8);
console.log("页面文字 " + all.length + " 条；>=12 字的 " + long.length + " 条，其中最长逐字相符 <8 字的 " + weak.length + " 条（占 " + (100*weak.length/long.length).toFixed(1) + "%）");
const byPage = {};
for (const w of weak) byPage[w.n] = (byPage[w.n]||0)+1;
console.log("--- 溯源偏弱的行（前 30） ---");
for (const w of weak.slice(0, 30)) console.log("  [p" + w.n + "][" + lcs(w.s) + "] " + w.s);
