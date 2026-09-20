// build-pptx.mjs —— 把 png/page-NN.png 打进 PPTX（16:9，1920x1080 图铺满整页）
// 依赖：本地 node_modules/pptxgenjs（从 lecture3-unified 复制，未联网下载）
// 备注：notes.json 由 build-slides.mjs 生成，内容即该页幻灯片上的文字，不含任何页面之外的新内容。
import { createRequire } from "node:module";
import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const PptxGenJS = require("./node_modules/pptxgenjs/dist/pptxgen.cjs.js");
const HERE = dirname(fileURLToPath(import.meta.url));

const notes = JSON.parse(await fsp.readFile(join(HERE, "notes.json"), "utf8"));
const noteOf = {};
for (const p of notes) noteOf[p.n] = p;

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pptx.layout = "W16x9";
pptx.author = "枫丹科学院非常规现象研究室";
pptx.title = "世界式与大一统（内部研究纪要 第 49 号 · 合订本）";
pptx.subject = "《世界式与大一统》合订本超长课件";

const files = (await fsp.readdir(join(HERE, "png")))
  .filter((f) => /^page-\d+\.png$/.test(f))
  // 必须按数值排！默认 .sort() 是字典序：page-100 会排到 page-11 前面，导致整本课件页序错乱
  .sort((x, y) => parseInt(x.match(/\d+/)[0], 10) - parseInt(y.match(/\d+/)[0], 10));
let missing = 0;
for (const f of files) {
  const n = parseInt(f.match(/(\d+)/)[1], 10);
  const s = pptx.addSlide();
  s.addImage({ path: join(HERE, "png", f), x: 0, y: 0, w: 13.333, h: 7.5 });
  const nt = noteOf[n];
  if (nt) s.addNotes("【第 " + n + " 页 · " + nt.title + "】\n\n" + nt.lines.join("\n"));
  else missing++;
}
await pptx.writeFile({ fileName: join(HERE, "世界式-大一统-合订本课件.pptx") });
console.log("PPTX 已生成，共 " + files.length + " 页；缺备注 " + missing + " 页 -> 世界式-大一统-合订本课件.pptx");
