import { promises as fsp } from "node:fs";
const d = "D:\\ai\\gongzuoqu\\tools\\world-formula-paper\\lecture4-merged\\_packs\\";
const a = JSON.parse(await fsp.readFile(d + "_v2a1.json", "utf8"));
const b = JSON.parse(await fsp.readFile(d + "_v2a2.json", "utf8"));
a.pages = a.pages.concat(b.pages);
await fsp.writeFile(d + "20-vol2a.json", JSON.stringify(a, null, 1), "utf8");
await fsp.unlink(d + "_v2a1.json"); await fsp.unlink(d + "_v2a2.json");
console.log("vol2a 合计 " + a.pages.length + " 页");
