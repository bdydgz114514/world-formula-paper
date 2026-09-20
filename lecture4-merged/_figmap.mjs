import { promises as fsp } from "node:fs";
const d = "D:\\ai\\gongzuoqu\\tools\\world-formula-paper\\lecture4-merged\\_packs\\";
const ORDER = ["00-front.json","10-vol1a.json","11-vol1b.json","12-vol1c.json","20-vol2a.json","21-vol2b.json","30-vol3a.json","31-vol3b.json","40-appx.json","90-end.json"];
let n = 0; const lines = [];
for (const f of ORDER) {
  const j = JSON.parse(await fsp.readFile(d + f, "utf8"));
  for (const p of j.pages) {
    n++;
    for (const r of (p.rows || [])) for (const c of (r.cells || [])) if (c.k === "fig") lines.push({ page: n, file: c.file });
  }
}
console.log("插图使用 " + lines.length + " 处");
console.log(lines.map(x => x.page + " " + x.file).join("\n"));
const byPack = {};
await fsp.writeFile(d + "_figmap.json", JSON.stringify(lines, null, 1), "utf8");
