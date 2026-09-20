// build-slides.mjs —— 《世界式与大一统》（内部研究纪要 第 49 号 · 合订本）超长课件
// 内容唯一来源：../世界式与大一统-合订本.md
// 版式沿用 lecture3-unified：960x540 SVG、Microsoft YaHei、同一套配色、同一批自检。
// 本文件由 _src/head.mjs + _packs/*.json + _src/tail.mjs 经 make-build.mjs 拼装而成。
// 页面是数据驱动的：每个 pack 里的每一页只写「标题 + 若干行 + 单元」，坐标与高度由渲染器算。
//
// 自检（9 项，任一不过即 exit 1）：
//   1 文字越界  2 容器高度  3 卡片重叠  4 文字被盖  5 页脚安全区
//   6 图片比例（不得拉伸）  7 标题压正文  8 标题压徽标  9 每页文字总量 ≤ 200 字

import { promises as fsp } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGDIR = join(HERE, "..", "figures");
const W = 960, H = 540;

const C = {
  navy: "#16324F", deep: "#0D2A47", teal: "#2A9D8F", gold: "#C9A227", red: "#A63A50",
  blue: "#3D7EA6", purple: "#8E7DBE", orange: "#E76F51", light: "#F4F7FB",
  card: "#FFFFFF", text: "#1B2A41", muted: "#5B6B7C", line: "#E3EBF0", white: "#FFFFFF",
  darkcard: "#10314F", darkline: "#27547C", darktext: "#E8F0F8",
};
const COL = (v, d) => (v === undefined || v === null ? d : (C[v] || v));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- 文本宽度估算（各项检查的依据） ----------
function textWidth(s, sz, o = {}) {
  s = String(s);
  if (o.mono) return s.length * 0.55 * sz;
  let u = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x2e80) u += 1.0;
    else if (ch === " ") u += 0.30;
    else if (/[0-9]/.test(ch)) u += 0.55;
    else if (/[A-Z]/.test(ch)) u += 0.64;
    else if (/[a-z]/.test(ch)) u += 0.54;
    else if (".,:;'|!i".includes(ch)) u += 0.30;
    else u += 0.52;
  }
  return u * sz * (o.w >= 700 ? 1.03 : 1.0);
}
function textBox(e) {
  const w = textWidth(e.s, e.sz, e);
  const left = e.a === "middle" ? e.x - w / 2 : e.a === "end" ? e.x - w : e.x;
  return { left, right: left + w, top: e.y - e.sz * 0.84, bottom: e.y + e.sz * 0.30, w };
}

// ---------- 插图 ----------
const FIGFILES = [
  "fig01-mindmap.png", "fig02-distinction.png", "fig03-coniunctio.png", "fig04-lucas.png",
  "fig05-selfloop.png", "fig06-two-forces.png", "fig07-curves.png", "fig08-threelayers.png",
  "fig09-godel.png", "fig10-descender.png", "fig11-conceptmap.png", "fig12-cases.png",
  "fig13-quadrants.png", "fig14-tutorial.png", "fig15-decisiontree.png", "fig16-cooking-curve.png",
  "fig17-recipe-quadrants.png", "fig18-gumbase-source.png", "fig19-elasticity-vs-assimilation.png",
  "fig20-population-limits.png", "fig21-feedback-loop.png", "fig22-cascade.png", "fig23-adjudication.png",
  "fig24-two-kinds-of-loss.png", "fig25-quadrants-compare.png", "fig26-spec-limit.png",
  "fig27-spec-properties.png", "fig28-three-operations.png", "fig29-variable-slot.png", "fig30-rene-audit.png",
  "figU01-mindmap.png", "figU02-two-recursions.png", "figU03-one-vs-two-roots.png", "figU04-three-couplings.png",
  "figU05-supersymmetry-retro.png", "figU06-loan-analogy.png", "figU07-where-to-stop.png", "figU08-four-routes.png",
  "figU09-two-families.png", "figU10-refutation-conditions.png", "figU11-difference-budget.png",
  "figU12-teyvat-correspondence.png", "figU13-zero-vs-nonzero.png", "figU14-mutual-explanation.png",
];
const FIGS = {};
for (const f of FIGFILES) {
  const buf = await fsp.readFile(join(FIGDIR, f));
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("不是 PNG: " + f);
  const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);
  FIGS[f] = { ar: pw / ph, px: pw + "x" + ph, b64: buf.toString("base64") };
}
const FIGUSED = new Set();

const pages = [];
let GID = 0;

class Page {
  constructor(n, o = {}) {
    this.n = n;
    this.dark = !!o.dark;
    this.noNum = !!o.noNum;
    this.titleText = o.title || "";
    this.els = [];
    this.groups = [];
  }
  push(e) { this.els.push(e); return e; }
  T(x, y, s, o = {}) {
    return this.push({
      k: "text", x, y, s: String(s), sz: o.sz === undefined ? 17 : o.sz,
      f: o.f || (this.dark ? C.darktext : C.text), w: o.w === undefined ? 400 : o.w,
      a: o.a || "start", op: o.op === undefined ? 1 : o.op, mono: !!o.mono, gid: o.gid || null,
    });
  }
  R(x, y, w, h, o = {}) {
    return this.push({
      k: "rect", x, y, w, h, rx: o.rx === undefined ? 14 : o.rx, f: o.f || C.card,
      ec: o.ec || null, sw: o.sw === undefined ? 1.5 : o.sw, op: o.op === undefined ? 1 : o.op,
      box: o.box === undefined ? true : o.box,
    });
  }
  CIRCLE(cx, cy, r, f, op) { return this.push({ k: "circle", cx, cy, r, f, op: op === undefined ? 1 : op }); }
  IMG(file, x, y, w, o = {}) {
    const f = FIGS[file];
    if (!f) throw new Error("缺少插图: " + file);
    FIGUSED.add(file);
    let h = w / f.ar;
    if (o.maxH && h > o.maxH) { h = o.maxH; w = h * f.ar; }
    if (o.centerIn) x += (o.centerIn - w) / 2;
    const e = { k: "image", x, y, w, h, file, b64: f.b64, ar: f.ar, box: true };
    this.push(e);
    return e;
  }
  HEAD(title, sub) {
    this.titleText = title;
    this.R(72, 52, 5, 30, { f: C.teal, rx: 2.5, box: false });
    this.T(92, 76, title, { sz: 30, w: 700, f: this.dark ? "#FFFFFF" : C.navy, gid: "head" });
    if (sub) this.T(92, 102, sub, { sz: 14, f: this.dark ? "#9FC0DC" : C.muted, gid: "head" });
  }
  PILL(x, y, s, o = {}) {
    const sz = o.sz || 14;
    const w = textWidth(s, sz, { w: 400 }) + 44;
    this.R(x, y, w, 38, { rx: 19, f: o.f || C.blue, op: 0.16, box: false });
    this.T(x + w / 2, y + 25, s, { sz, a: "middle", f: o.tf || "#BFD9F0" });
    return w;
  }
}

// ---------- 版面常量（自动排版） ----------
const CX = 72, CW = 816, TOP = 126, BOT = 482, RGAP = 16;
const COLW = { 1: [816], 2: [400, 400], 3: [261.33, 261.33, 261.34] };
function colGeom(cols) {
  const ws = COLW[cols];
  const out = [];
  let x = CX;
  for (let i = 0; i < ws.length; i++) { out.push({ x, w: ws[i] }); x += ws[i] + 16; }
  return out;
}
const DEF_LH = 25;

// 单位：一个卡片的自然高度 + 元素
function cardPlan(cell, w, top, page, dark) {
  const accent = COL(cell.accent, C.teal);
  const bx = cell.bx === undefined ? 20 : cell.bx;
  const lh0 = cell.lh === undefined ? DEF_LH : cell.lh;
  const bsz0 = cell.bsz === undefined ? 14 : cell.bsz;
  const lines = cell.lines || [];
  let cur = top + (cell.title ? 64 : 34);
  const placed = [];
  for (const raw of lines) {
    const L = typeof raw === "string" ? { s: raw } : raw;
    cur += L.gap || 0;
    const sz = L.sz || bsz0;
    placed.push({ L, sz, y: cur });
    cur += (L.lh === undefined ? lh0 : L.lh);
  }
  const lastBase = placed.length ? placed[placed.length - 1].y : top + (cell.title ? 34 : 16);
  const h = Math.max(cell.title ? 84 : 56, lastBase + 16 - top);
  return { accent, bx, h, placed };
}

function emitCard(page, cell, x, y, w, h) {
  const dark = page.dark;
  const plan = cardPlan(cell, w, 0, page, dark);
  const accent = plan.accent, bx = x + plan.bx;
  const gid = ++GID;
  const rect = page.R(x, y, w, h, {
    f: cell.fill ? COL(cell.fill, C.card) : (dark ? C.darkcard : C.card),
    ec: cell.ec ? COL(cell.ec, C.line) : (dark ? C.darkline : C.line),
    rx: cell.rx === undefined ? 14 : cell.rx,
  });
  if (cell.bar !== false) page.R(x, y, w, 5, { f: accent, rx: 2.5, box: false });
  if (cell.leftBar) page.R(x, y, 6, h, { f: accent, rx: 3, box: false });
  const group = { id: gid, rect, texts: [], accent, page: page.n };
  if (cell.title) {
    const t = page.T(bx, y + 34, cell.title, { sz: cell.tsz || 15.5, w: 700, f: cell.tf ? COL(cell.tf, accent) : (dark ? "#FFFFFF" : accent), gid });
    group.texts.push(t); group.titleBox = textBox(t);
  }
  if (cell.badge) {
    const b = cell.badge, bsz = b.sz || 12, bc = COL(b.c, C.orange);
    const bw = textWidth(b.s, bsz, { w: 700 }) + 22;
    const bxx = x + w - bw - 14, byy = y + 10;
    page.R(bxx, byy, bw, 22, { rx: 11, f: bc, op: 0.15, box: false });
    group.texts.push(page.T(bxx + bw / 2, byy + 15.5, b.s, { sz: bsz, w: 700, f: bc, a: "middle", gid }));
    group.badge = { left: bxx, right: bxx + bw };
  }
  for (const p of plan.placed) {
    const L = p.L, sz = p.sz, yy = y + p.y;
    if (L.pre) {
      const t1 = page.T(bx, yy, L.pre, { sz, w: 700, f: L.pf ? COL(L.pf, accent) : accent, gid });
      const t2 = page.T(bx + textWidth(L.pre, sz, { w: 700 }), yy, L.s, { sz, f: L.f ? COL(L.f, C.text) : (dark ? C.darktext : C.text), op: L.op === undefined ? 0.92 : L.op, gid });
      group.texts.push(t1, t2);
      if (!group.bodyFirst) group.bodyFirst = t1;
    } else {
      const te = page.T(bx + (L.indent || 0), yy, L.s, {
        sz, w: L.w === undefined ? 400 : L.w, f: L.f ? COL(L.f, C.text) : (dark ? C.darktext : C.text),
        op: L.op === undefined ? 0.92 : L.op, mono: !!L.mono, gid,
      });
      group.texts.push(te);
      if (!group.bodyFirst) group.bodyFirst = te;
    }
  }
  page.groups.push(group);
  return group;
}

function emitFig(page, cell, col, y, rowH) {
  const avail = col.w;
  const maxH = cell.maxH === undefined ? 9999 : cell.maxH;
  const f = FIGS[cell.file];
  let w = Math.min(avail, cell.w || avail), h = w / f.ar;
  if (h > maxH) { h = maxH; w = h * f.ar; }
  const x = col.x + (avail - w) / 2;
  const e = page.IMG(cell.file, x, y, w, {});
  if (cell.caption) {
    const t = page.T(x + w / 2, y + h + 21, cell.caption, { sz: 12.5, f: page.dark ? "#9FC0DC" : C.muted, a: "middle" });
    e.caption = t;
  }
  return e;
}

function buildPage(spec, n) {
  const p = new Page(n, { dark: spec.dark, noNum: spec.noNum, title: spec.title });
  for (const d of (spec.deco || [])) {
    const [cx, cy, r, col, op] = d;
    p.CIRCLE(cx, cy, r, COL(col, C.blue), op);
  }
  for (const t of (spec.texts || [])) {
    p.T(t.x, t.y, t.s, { sz: t.sz, w: t.w, f: t.f ? COL(t.f, C.text) : (p.dark ? C.darktext : C.text), a: t.a, op: t.op, mono: t.mono });
  }
  for (const q of (spec.pills || [])) p.PILL(q.x, q.y, q.s, { sz: q.sz, f: q.f ? COL(q.f, C.blue) : C.blue, tf: q.tf });
  if (spec.head) p.HEAD(spec.head, spec.sub);

  let y = TOP;
  for (const row of (spec.rows || [])) {
    const geom = colGeom(row.cols);
    const cells = row.cells || [];
    if (cells.length !== row.cols) throw new Error("第 " + n + " 页：cols=" + row.cols + " 但 cells=" + cells.length);
    let rowH = 0;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (c.k === "card") rowH = Math.max(rowH, cardPlan(c, geom[i].w, 0, p, p.dark).h);
      else if (c.k === "fig") {
        const f = FIGS[c.file];
        if (!f) throw new Error("第 " + n + " 页：缺少插图 " + c.file);
        let w = Math.min(geom[i].w, c.w || geom[i].w), h = w / f.ar;
        const maxH = c.maxH === undefined ? 9999 : c.maxH;
        if (h > maxH) h = maxH;
        rowH = Math.max(rowH, h + (c.caption ? 26 : 0));
      } else if (c.k === "blank") { /* spacer */ }
      else throw new Error("第 " + n + " 页：未知单元 " + c.k);
    }
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (c.k === "card") emitCard(p, c, geom[i].x, y, geom[i].w, rowH);
      else if (c.k === "fig") emitFig(p, c, geom[i], y, rowH);
    }
    y += rowH + RGAP;
  }
  p.usedBottom = y - RGAP;
  return p;
}
