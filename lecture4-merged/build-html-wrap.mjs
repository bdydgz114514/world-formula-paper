import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const files = (await fsp.readdir(HERE)).filter(f => /^page-\d+\.svg$/.test(f)).sort();
for (const f of files) {
  const svg = await fsp.readFile(join(HERE, f), "utf8");
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    + 'html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#F4F7FB}'
    + 'svg{display:block;width:100vw;height:100vh}'
    + '</style></head><body>' + svg.replace(/^<\?xml[^>]*\?>\s*/, "") + '</body></html>';
  await fsp.writeFile(join(HERE, "_render", f.replace(/\.svg$/, ".html")), html, "utf8");
}
console.log("包装 " + files.length + " 页（满屏缩放）");
