// make-build.mjs —— 把 _src/head.mjs + _packs/*.json + _src/tail.mjs 拼成单文件 build-slides.mjs
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const ORDER = ["00-front.json", "10-vol1a.json", "11-vol1b.json", "12-vol1c.json",
  "20-vol2a.json", "21-vol2b.json", "30-vol3a.json", "31-vol3b.json", "40-appx.json", "90-end.json"];
const head = await fsp.readFile(join(HERE, "_src", "head.mjs"), "utf8");
const tail = await fsp.readFile(join(HERE, "_src", "tail.mjs"), "utf8");
const packs = [];
for (const f of ORDER) {
  try {
    const j = JSON.parse(await fsp.readFile(join(HERE, "_packs", f), "utf8"));
    j.id = f.replace(/\.json$/, "");
    packs.push(j);
  } catch (e) { console.log("跳过 " + f + "：" + e.message); }
}
const data = "\n// ============================== 页面数据 ==============================\n"
  + "const PACKS = " + JSON.stringify(packs, null, 1) + ";\n";
await fsp.writeFile(join(HERE, "build-slides.mjs"), head + data + tail, "utf8");
const total = packs.reduce((a, p) => a + p.pages.length, 0);
console.log("已拼装 build-slides.mjs：" + packs.length + " 个 pack，共 " + total + " 页");
