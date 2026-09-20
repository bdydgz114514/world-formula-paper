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

// ============================== 页面数据 ==============================
const PACKS = [
 {
  "pages": [
   {
    "title": "封面",
    "dark": true,
    "noNum": true,
    "deco": [
     [
      110,
      70,
      170,
      "blue",
      0.08
     ],
     [
      880,
      480,
      220,
      "teal",
      0.07
     ],
     [
      820,
      80,
      90,
      "white",
      0.04
     ]
    ],
    "pills": [
     {
      "x": 72,
      "y": 56,
      "s": "枫丹科学院非常规现象研究室 · 内部研究纪要 第 49 号",
      "sz": 14,
      "tf": "#BFD9F0"
     }
    ],
    "texts": [
     {
      "x": 480,
      "y": 218,
      "s": "世界式与大一统",
      "sz": 52,
      "w": 700,
      "f": "#FFFFFF",
      "a": "middle"
     },
     {
      "x": 480,
      "y": 296,
      "s": "两份内部研究纪要的合订重编本",
      "sz": 22,
      "f": "#BFD4E6",
      "a": "middle"
     },
     {
      "x": 480,
      "y": 352,
      "s": "「两份材料里各缺一个位置，而那两个位置长得一样。」",
      "sz": 17,
      "f": "#8FB0CC",
      "a": "middle"
     },
     {
      "x": 480,
      "y": 398,
      "s": "第一卷　世界式　·　第二卷　大一统　·　第三卷　接缝",
      "sz": 14,
      "f": "#8FB0CC",
      "a": "middle"
     },
     {
      "x": 480,
      "y": 466,
      "s": "超长课件 · 164 页 · 三卷加合并附录 A~F",
      "sz": 14,
      "f": "#7C9BB8",
      "a": "middle",
      "op": 0.85
     }
    ],
    "rows": []
   },
   {
    "title": "目录",
    "head": "目录",
    "sub": "三卷加合并附录",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "四段",
        "accent": "navy",
        "lines": [
         {
          "pre": "第一卷　",
          "s": "世界式：一个封闭系统的算术　07–74"
         },
         {
          "pre": "第二卷　",
          "s": "大一统：一个缺失的项　75–118"
         },
         {
          "pre": "第三卷　",
          "s": "接缝：两份材料互相解释　119–159"
         },
         {
          "pre": "附录　",
          "s": "主张台账全表：30 条主张的方向与等级　160–162"
         }
        ]
       }
      ]
     },
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         "三件物证反推出一台算式。",
         {
          "s": "二阶，两个根。",
          "f": "navy",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         "两个并排写下的式子。",
         {
          "s": "差的是一阶。",
          "f": "navy",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         "两份材料互相解释。",
         {
          "s": "比包含弱，比类比强。",
          "f": "navy",
          "w": 700
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "合订说明",
    "head": "合订说明：为什么把两份并成一份",
    "sub": "理由只有一条，代价也要写出来",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "合订的理由",
        "accent": "gold",
        "lines": [
         "第 47 号研究的是一台算式。",
         "第 48 号研究的是一个困难。",
         {
          "s": "分开读，会丢掉它们之间那件事。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "那件事是什么",
        "accent": "teal",
        "lines": [
         "两份材料里各有一个算不进去的东西。",
         {
          "s": "两个「缺」都是位置，不是数值。",
          "f": "navy",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "合订的代价",
        "accent": "red",
        "lines": [
         "篇幅膨胀；两套编号；同一个词在两卷里可能不同义。",
         {
          "s": "对应不等于同义。见附录 A。",
          "f": "muted",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "合订不是为了显得多，是为了让接缝有地方写。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "体例 · 两条轴",
    "head": "体例：每一条结论都要有两个坐标",
    "sub": "两个轴独立，第二条更要紧",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "证据强度",
        "badge": {
         "s": "甲 / 乙 / 丙",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         {
          "s": "原文有多硬。",
          "f": "navy",
          "w": 700
         },
         "甲级：原文直说。",
         "乙级：需要一步翻译。",
         "丙级：只是形状对应。"
        ]
       },
       {
        "k": "card",
        "title": "推理方向",
        "badge": {
         "s": "预测 / 回溯",
         "c": "blue"
        },
        "accent": "blue",
        "lines": [
         {
          "s": "是在看见证据之前推出的，还是之后套上去的。",
          "sz": 13
         },
         {
          "pre": "预测　",
          "s": "先有结论，后找证据",
          "pf": "red"
         },
         {
          "pre": "回溯　",
          "s": "先见证据，后接框架"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         {
          "pre": "甲级 + 回溯　",
          "s": "原文很清楚，本院只是把它纳入框架",
          "w": 700,
          "pf": "teal"
         },
         {
          "s": "→ 不算对框架的支持",
          "f": "muted",
          "sz": 13,
          "indent": 0
         }
        ]
       },
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "pre": "丙级 + 预测　",
          "s": "原文没直说，框架提前推出了它",
          "w": 700,
          "pf": "orange"
         },
         {
          "s": "→ 比上一条更有分量",
          "f": "muted",
          "sz": 13,
          "indent": 0
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "怎么读等级",
    "head": "怎么读等级：回溯类必须交出一句话",
    "sub": "说不出的，就不是补论，只是一段附会",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本纪要的硬规矩",
        "accent": "red",
        "lines": [
         "凡是标着「回溯」的篇章，末尾都有一节：",
         {
          "s": "什么情况下这一篇会被推翻。",
          "w": 700,
          "f": "red"
         },
         {
          "s": "本院恳请读者去攻那一节。",
          "f": "muted",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第三卷整卷都是回溯的",
        "accent": "teal",
        "lines": [
         "它是先有了两份材料、才去写接缝的。",
         "所以每一章都要交代自己的推翻条件。"
        ]
       },
       {
        "k": "card",
        "title": "最值钱的地方",
        "accent": "orange",
        "lines": [
         "真正值钱的不是那些对应关系，",
         {
          "s": "而是那些被标成丙级的地方。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "两份原件性质不同",
    "head": "两份原件性质不同，这一点必须一直记着",
    "sub": "所以第二卷整体比第一卷弱一档",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一卷（世界式）",
        "badge": {
         "s": "有原文",
         "c": "gold"
        },
        "accent": "blue",
        "lines": [
         {
          "pre": "研究对象　",
          "s": "一个虚构世界的内部规则",
          "pf": "blue"
         },
         {
          "pre": "原文可查　",
          "s": "有——三件物证、任务记录、地图文本",
          "pf": "blue"
         },
         {
          "pre": "做实验　",
          "s": "不能",
          "pf": "blue"
         },
         {
          "pre": "最强结论　",
          "s": "甲级 10 条（原文直证）",
          "pf": "blue"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二卷（大一统）",
        "badge": {
         "s": "无原文",
         "c": "red"
        },
        "accent": "purple",
        "lines": [
         {
          "pre": "研究对象　",
          "s": "真实物理",
          "pf": "purple"
         },
         {
          "pre": "原文可查　",
          "s": "没有——读的是二手转述",
          "pf": "purple"
         },
         {
          "pre": "做实验　",
          "s": "能——但本院没做",
          "pf": "purple"
         },
         {
          "pre": "最强结论　",
          "s": "本院自己的判断里一条甲级也没有",
          "pf": "purple"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "所以第二卷整体比第一卷弱一档。这不是谦虚，是记账。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "00-front"
 },
 {
  "pages": [
   {
    "title": "第零章 · 缘起：三件物证与一个方程式",
    "head": "第零章 · 缘起：三件物证与一个方程式",
    "sub": "本章不给出算式；要给出的是这道题为什么值得算",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三件物证",
        "accent": "blue",
        "lines": [
         "甲：散落的书页。",
         "乙：雷内的调查笔记。",
         "丙：神秘的书页。"
        ]
       },
       {
        "k": "fig",
        "file": "fig01-mindmap.png",
        "maxH": 190,
        "caption": "图 1　世界式研究总览。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "三件物证给出的不是三个谜题，是一个谜题的三次复现。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证甲 · 散落的书页",
    "head": "物证甲 · 散落的书页",
    "sub": "一份招募文书必然会暴露招募者相信什么",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "世界式是专名",
        "badge": {
         "s": "甲级",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "原文用书名号式的引号。",
         {
          "s": "它是一套计算，不是一句口号。",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "结果是一个图景",
        "badge": {
         "s": "甲级",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "原文用「所预见的景象」。",
         {
          "s": "它告诉人会有什么。",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "他认为可改",
        "badge": {
         "s": "乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "若不可改，他不必求力量。",
         {
          "s": "求力量是一次行动性断言。",
          "w": 700
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "pre": "不能证明　",
          "s": "结果必然、算的是哪个量、终末性质、作者算对了",
          "w": 700,
          "pf": "red"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证甲 · 终末的措辞",
    "head": "物证甲 · 一句措辞里的缝隙",
    "sub": "「连甜甜花和薄荷都长不出来的世界」",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "这不是「被烧毁的世界」",
        "accent": "orange",
        "lines": [
         "甜甜花与薄荷最常见、最不挑环境。",
         {
          "s": "连它们都长不出来，是失去了生长所需的前置条件。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "毁灭在哪里出现",
        "accent": "red",
        "lines": [
         "原文写的是「灾祸之后的毁灭」。",
         {
          "s": "终末在毁灭之后，是另一个阶段。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "这条缝隙的用处",
        "accent": "blue",
        "lines": [
         "原文把毁灭与终末分开了。",
         {
          "s": "第三章会用到这个区分。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证乙 · 雷内的调查笔记",
    "head": "物证乙 · 雷内的调查笔记：「漏了变量？」",
    "sub": "五个字是本纪要全部工作的起点",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "「虽然不想承认，但无论计算多少次结果都一样。」",
          "w": 700,
          "f": "navy",
          "sz": 15
         },
         {
          "s": "「毁灭？漏了变量？」",
          "w": 700,
          "f": "red",
          "sz": 15
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "一个问号，接一个问号",
        "accent": "teal",
        "lines": [
         "他把两件事并列成两个待选项。",
         {
          "s": "一个认定命运如此的人，不会给它配备选项。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "同段的两个旁证",
        "accent": "blue",
        "lines": [
         "「和雅各布交叉核实」——至少两人独立算。",
         "「明天再核查一次」——他计划再算。"
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "pre": "判断（回溯，丙级）　",
          "s": "「明天再核查一次」与最终结果之间，可能发生过一次未记录的中断",
          "pf": "purple",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证乙 · 他找到的另一个方向",
    "head": "物证乙 · 他找到的另一个方向",
    "sub": "提炼、映射、萃取——一个工程师的动词表",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "原文的四个动词",
        "accent": "blue",
        "lines": [
         "「将其提炼的方法，映射在……的力量」",
         {
          "s": "从中「萃取出其中的『意志』」",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "判断（回溯，乙级）",
        "badge": {
         "s": "乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "他在方法的层面已走在正确的路上。",
         "要把算式的结构搬到力上去。"
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "代价：降级条件",
        "accent": "red",
        "lines": [
         "若「萃取意志」只是修辞，",
         {
          "s": "本条降为丙级。",
          "f": "red",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "这本笔记不是给人看的",
        "accent": "purple",
        "lines": [
         "它夹杂着果酱、干面包、同伴的牙齿。",
         {
          "s": "所以它坦率，也所以它不完备。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证丙 · 神秘的书页",
    "head": "物证丙 · 法图纳与世界式",
    "sub": "同一个东西的两种情形",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "两份材料说的是同一套图式",
        "accent": "gold",
        "lines": [
         "古教团说：文明灭了一个还会再来一个。",
         {
          "s": "世界式的作者却发现：已经不会再有新的文明诞生了。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判断：同一个人写的",
        "badge": {
         "s": "甲级",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "「我所推导出并命名为『世界式』的」",
         {
          "s": "甲级原文直证，不需要推翻条件。",
          "f": "muted",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "所以中间有个参数被动过",
        "accent": "orange",
        "lines": [
         "两处「结果都是一样」表达的是同一次计算。",
         {
          "s": "这是同式两解的地基。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "物证丙 · 「已经」与「除非」",
    "head": "物证丙 · 「已经」与「除非」",
    "sub": "一个时间副词，一个排他性的词",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "「已经」",
        "badge": {
         "s": "乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "它把静态对照变成时序对照。",
         {
          "s": "不是他们错了，是他们那套曾经成立。",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "「除非」",
        "badge": {
         "s": "乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "「除非考虑引入系统之外的『变量』」",
         {
          "s": "它不是希望，是唯一的例外。",
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "一个不舒服的观察（回溯，乙级）",
        "accent": "red",
        "lines": [
         "写这句的人已经把系统封闭当成前提接受了。",
         {
          "s": "他不再问系统是不是封闭的。",
          "f": "red",
          "w": 700
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "三件物证对照表",
    "head": "三件物证对照表",
    "sub": "本章最有用的一页",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "甲 · 散落的书页",
        "accent": "blue",
        "lines": [
         "一个学派中的组织者。",
         "写给外来者。",
         {
          "s": "能证明：存在一套计算。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "乙 · 调查笔记",
        "accent": "purple",
        "lines": [
         "雷内，私人工作记录。",
         "坎瑞亚文献到手之后。",
         {
          "s": "能证明：同化是共同动作。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "丙 · 神秘的书页",
        "accent": "teal",
        "lines": [
         "雷内，据「我推导并命名」。",
         "古代教团之后。",
         {
          "s": "能证明：更早的模型存在。",
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "gold",
        "lines": [
         {
          "pre": "判断　",
          "s": "三件物证没有一件说过世界式的结果是零",
          "w": 700,
          "pf": "gold"
         },
         {
          "s": "「零」是从算子的性质里推出来的，不是抄下来的。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "两个动作，同一个位置",
    "head": "两个动作，同一个位置",
    "sub": "本章最重要的一节，合订本修订时补上",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "第一卷的「变量」，第二卷的「项」。",
         {
          "s": "两个文本的核心动作，是同一个动作：在缺项上停住。",
          "w": 700,
          "f": "navy",
          "sz": 15
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "字面上是相反的",
        "accent": "blue",
        "lines": [
         "「漏了变量」预设一个多出来的东西。",
         {
          "s": "「补上那一项」预设一个空着的位置。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "但结构上是同一件事",
        "accent": "purple",
        "lines": [
         "差别落在发现者的处境，不落在结构。",
         {
          "s": "那个决定结果的东西不在系统内部。",
          "f": "navy",
          "w": 700
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "两条推翻条件",
        "accent": "red",
        "lines": [
         "若记忆项与初始项无关，并置不成立。",
         {
          "s": "若它指的是算子而非输入，动作性质不同。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 预备知识",
    "head": "第一章 · 预备知识",
    "sub": "本章是纯工具章，不含关于提瓦特的实质主张",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "工具箱",
        "accent": "blue",
        "lines": [
         "递推 + 初始项。",
         "算子、迭代、不动点。",
         "收敛的两条判据。"
        ]
       },
       {
        "k": "card",
        "title": "本院定的两个概念",
        "accent": "teal",
        "lines": [
         "差别度 D。",
         {
          "s": "同化。",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "一件旧工具",
        "accent": "purple",
        "lines": [
         "形式系统。",
         {
          "s": "哥德尔定理。",
          "w": 700
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "这套材料的说服力不来自工具的先进，而来自用它算出来的东西能被原文的措辞一一对上。",
          "w": 700,
          "f": "navy",
          "sz": 14
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "递推：规则 + 初始项",
    "head": "递推：规则 + 初始项 = 整个数列",
    "sub": "一句要记住的话，后面会被反复使用",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两条规则生出的两个宇宙",
        "accent": "blue",
        "lines": [
         "情形一，初始项取 (1, 1)：1 1 2 3 5 8 …",
         "情形二，初始项取 (2, 1)：2 1 3 4 7 11 …",
         {
          "s": "规则只有一条：后一项等于前两项之和。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "三处相同，一处不同",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "规则相同；比值同归 1.618。",
         {
          "s": "两条轨道永不相交。",
          "w": 700,
          "f": "navy"
         },
         {
          "pre": "不同　",
          "s": "每一项的值不同",
          "pf": "red"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "「殊途同归」在数学里是有条件的：比值同归，数列不同归。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "算子、迭代、不动点与吸引子",
    "head": "算子、迭代、不动点、吸引子",
    "sub": "研究对象从结果换成规律",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "一个可以数的例子",
        "accent": "blue",
        "lines": [
         "状态 {0,1,2,10,11}，算子取最接近的两个数求平均。",
         {
          "s": "5 → 4 → 3 → 3 → 2 → 1",
          "w": 700,
          "mono": true,
          "sz": 14
         }
        ]
       },
       {
        "k": "card",
        "title": "三条性质",
        "accent": "teal",
        "lines": [
         "不同的值的个数只减不增。",
         "这个过程是不可逆的。",
         {
          "s": "只剩一个值时，算子就没有事可做了。",
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两支轨道的对照",
        "accent": "purple",
        "lines": [
         {
          "s": "收缩算子：换个起点也到同一个地方。",
          "w": 700,
          "f": "navy"
         },
         "不收缩：初始项是本质的。"
        ]
       },
       {
        "k": "card",
        "title": "第二卷的另一种语言",
        "accent": "orange",
        "lines": [
         {
          "s": "同一台机器，不同的起点，同一个终点。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "那里把它叫做「一阶递推没有记忆」。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "收敛的两条判据与三条边界",
    "head": "收敛：两条判据，三条边界",
    "sub": "世界式的收敛比例题弱",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判据一",
        "accent": "blue",
        "lines": [
         "单调 + 有界 → 收敛。",
         {
          "s": "去掉有界就不成立。",
          "f": "muted",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "判据二",
        "accent": "gold",
        "lines": [
         "一致压缩 → 收敛到唯一不动点。",
         {
          "s": "压缩比必须严格小于 1。",
          "f": "muted",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "边界三",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "世界式所需的收敛，只能由判据一来担保。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "为什么：同化算子只承诺「不增」，不承诺一致压缩。",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "两条推翻条件",
        "accent": "red",
        "lines": [
         "若同化算子是一致压缩，本条的限定多余。",
         {
          "s": "若它连单调都不保证，3.3 节的证明需要重写。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "差别度 D",
    "head": "差别度 D：可区分事物的总量",
    "sub": "一个中等教育里没有、但必须展开讲的概念",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两个必须分开的词",
        "accent": "orange",
        "lines": [
         {
          "pre": "毁灭　",
          "s": "东西还在，只是坏了",
          "pf": "red"
         },
         {
          "pre": "合并　",
          "s": "东西不在了，因为它们成了一个",
          "pf": "teal"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig02-distinction.png",
        "maxH": 170,
        "caption": "图 2　差别度 D 的直观含义。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "生长就是差别的产生",
        "accent": "teal",
        "lines": [
         "一粒种子发芽，就是从同质里分化出根、茎、叶。",
         {
          "s": "一个长不出植物的世界，是物质已无法再分化出结构。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "D 不是熵",
    "head": "D 不是人口、物质、能量，也不是熵",
    "sub": "争的不是同一件事",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条否决",
        "accent": "red",
        "lines": [
         "人口可以不变而 D 归零。",
         "物质总量守恒的系统可以 D 归零。",
         "能量有方向、有正负、有守恒律。",
         {
          "s": "D 只有一个方向。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "熵与 D 的对照",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "pre": "熵　",
          "s": "默认趋势是增加",
          "pf": "blue"
         },
         {
          "pre": "D　",
          "s": "在封闭系统里减少",
          "pf": "red"
         },
         {
          "s": "热平衡的气体熵最大，而差别度是零。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "熵说的是一个宏观态对应多少个微观态；D 说的是这个系统里还有多少种不同的东西。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "合并不创造差别",
    "head": "一条对后面很关键的算术",
    "sub": "合并这一步本身不产生新的可区分性",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "命题",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "把两个可区分的东西合成一个，",
         {
          "s": "可区分事物的总量不会增加。",
          "w": 700,
          "f": "navy"
         },
         {
          "pre": "合并前　",
          "s": "A、B",
          "pf": "blue"
         },
         {
          "pre": "合并后　",
          "s": "C",
          "pf": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "本院自己想到的最强质疑",
        "accent": "purple",
        "lines": [
         "规则的种类是不是一种可被消耗的差别？",
         {
          "s": "答复：规则不属于被合并的对象，它属于算子。",
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三条推翻条件",
        "accent": "red",
        "lines": [
         "若存在无外部输入时自发产生新差别的源。",
         "若「可区分」被证明是非数值的序结构。",
         {
          "s": "若合并规则的规则空间本身可被消耗。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "D 的下降与能分辨的下降",
    "head": "D 的下降，与「我们能分辨」的下降",
    "sub": "一个本院自己找出来的漏洞",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "在观测能力有限的情况下，两者在有限时间内无法区分。",
          "w": 700,
          "f": "navy",
          "sz": 15
         },
         {
          "s": "它没有原文支撑，只是一个形状上的对应。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它的后果",
        "accent": "red",
        "lines": [
         "本纪要不能宣称读者「能看见」D 归零。",
         {
          "s": "只能宣称它「算得出」D 归零。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "本院的态度",
        "accent": "blue",
        "lines": [
         "把它写进正文，而不是藏进附注。",
         {
          "s": "最弱的地方要暴露在最容易被攻击的位置。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "同化：四条性质",
    "head": "同化：一种特殊的算子",
    "sub": "它是算子的性质，不是一次事件",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条性质",
        "accent": "teal",
        "lines": [
         {
          "pre": "一　",
          "s": "不可逆",
          "pf": "teal",
          "w": 700
         },
         {
          "pre": "二　",
          "s": "自加速",
          "pf": "teal",
          "w": 700
         },
         {
          "pre": "三　",
          "s": "不需要外力",
          "pf": "teal",
          "w": 700
         },
         {
          "pre": "四　",
          "s": "可以局部累加",
          "pf": "teal",
          "w": 700
         }
        ]
       },
       {
        "k": "card",
        "title": "自加速的算术形态",
        "accent": "gold",
        "lines": [
         {
          "pre": "0→1　",
          "s": "5 → 4　相对减少 20%",
          "pf": "blue"
         },
         {
          "pre": "1→2　",
          "s": "4 → 3　相对减少 25%",
          "pf": "blue"
         },
         {
          "pre": "4→5　",
          "s": "2 → 1　相对减少 50%",
          "pf": "blue"
         },
         {
          "s": "绝对减少量是常数，相对减少量在上升。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "已合并的部分越大，剩下部分被合并得越快。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "形式系统与哥德尔定理",
    "head": "形式系统与哥德尔定理",
    "sub": "为什么「在系统内卡漏洞」不是奇迹",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "足够复杂",
        "badge": {
         "s": "强",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "要能给自己编号。",
         {
          "s": "历法、工程、科学院。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "自洽",
        "badge": {
         "s": "弱",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         "堵死「若可证则矛盾」。",
         {
          "s": "四百年观测未发现法则矛盾。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "递归可公理化",
        "badge": {
         "s": "中",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "把证明试完。",
         {
          "s": "历代学者一直在列举法则。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院要在此处补一句最重要的技术话",
        "accent": "purple",
        "lines": [
         {
          "s": "结论是条件句，不是无条件句。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "没有任何一步允许本院说「提瓦特一定有空子」——那是肯定前件，而不是推导。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 本章的自评与边界",
    "head": "第一章 · 本章的自评与边界",
    "sub": "三处薄弱点，本院自己列出来",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "薄弱点一",
        "accent": "red",
        "lines": [
         "收敛只能用判据一。",
         {
          "s": "若算子连单调都不保证，3.3 节重写。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "薄弱点二",
        "accent": "red",
        "lines": [
         "合并不创造差别依赖算子不变。",
         {
          "s": "若算子被改过，适用范围缩小。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "薄弱点三",
        "accent": "red",
        "lines": [
         "三个前提里，前提二是假设。",
         {
          "s": "若发现法则层面的矛盾，4.2 节作废。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         "本章的工具有限，而且都很旧。",
         {
          "s": "如果第三章错了，错误应该能定位到 1.4 或 1.5.2 的某一个前提上。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 世界式的原理",
    "head": "第二章 · 世界式的原理：三步",
    "sub": "算什么量、算子是什么、递推形式是什么",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三个问题，一条流水线",
        "accent": "blue",
        "lines": [
         {
          "pre": "第一步　",
          "s": "它算的是什么量",
          "pf": "blue",
          "w": 700
         },
         {
          "pre": "第二步　",
          "s": "它的算子是什么",
          "pf": "blue",
          "w": 700
         },
         {
          "pre": "第三步　",
          "s": "它的递推形式是什么",
          "pf": "blue",
          "w": 700
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "线索一：结果恒定",
        "accent": "teal",
        "lines": [
         "「不管推演多少遍，结果都是一样。」",
         {
          "s": "它算的一定是某种状态量，不是随机事件。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "线索二：终末的描述方式",
        "accent": "teal",
        "lines": [
         "「连甜甜花和薄荷都长不出来的世界」。",
         {
          "s": "不是焦土，是不再有生长这件事。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一步 · 它算的是什么量",
    "head": "第一步 · 候选量清单与逐条否决",
    "sub": "被否决的理由是同一条",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "否决",
        "accent": "red",
        "lines": [
         "人口 / 生物总量。",
         "物质总量、能量。",
         "元素浓度 / 元素总量。",
         {
          "s": "熵（且方向相反）。",
          "f": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "保留",
        "accent": "gold",
        "lines": [
         "地脉流量：能解释局部枯竭。",
         {
          "s": "信息量：与「区别」形似。",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "采纳",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "差别度 D。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "与「不分彼此」「长不出来」都吻合。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "它们在世界被搅成一锅汤之后仍然在——但一锅均匀的汤长不出甜甜花。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二步 · 算子是什么",
    "head": "第二步 · 算子是什么",
    "sub": "两种底层力方向相反，性质相同",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "一个排序判断",
        "badge": {
         "s": "甲级",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "灵光与元素力相比，反而与深渊更相似。",
         {
          "s": "「接触到的物质、能量会被同化。」",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig03-coniunctio.png",
        "maxH": 130,
        "caption": "图 3　密合算子。3 与 4 交叠得到 7。"
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三力表",
        "accent": "blue",
        "lines": [
         {
          "pre": "光界力　",
          "s": "减小 D（同化）",
          "pf": "blue"
         },
         {
          "pre": "虚界力　",
          "s": "减小 D（同化）",
          "pf": "blue"
         },
         {
          "pre": "人界力　",
          "s": "维持，但需要持续投入",
          "pf": "gold"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig06-two-forces.png",
        "maxH": 130,
        "caption": "图 6　两种力方向相反，性质相同。"
       }
      ]
     }
    ]
   },
   {
    "title": "第三步 · 递推形式",
    "head": "第三步 · 四个候选与一个采纳",
    "sub": "本院这一节最弱的地方",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "采纳：二阶、自指、密合型",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "W(n+1) = W(n) ⊕ W(n−1)",
          "mono": true,
          "sz": 14,
          "f": "gold",
          "w": 700
         },
         "需要两个初值才启动。",
         {
          "s": "最早填入的输入值出现了变动。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig05-selfloop.png",
        "maxH": 130,
        "caption": "图 5　世界式是一个自指递归。"
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三条理由",
        "accent": "blue",
        "lines": [
         "必须是自指的，否则无法从内部反推。",
         "它解释了「初始项」这个词为什么出现。",
         {
          "s": "它与 3-4-7 的生成方式一致。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig04-lucas.png",
        "maxH": 130,
        "caption": "图 4　卢卡斯数列与宇宙学阶梯。"
       }
      ]
     }
    ]
   },
   {
    "title": "结果恒定之谜：三层解释",
    "head": "结果恒定：三层解释",
    "sub": "三层不是三个备选答案",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一层",
        "accent": "blue",
        "lines": [
         "同一个人算两遍为什么一样？",
         {
          "s": "确定性递推 + 固定初始项。",
          "f": "navy",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "第二层",
        "accent": "teal",
        "lines": [
         "换个起点为什么也一样？",
         {
          "s": "吸引子是唯一的。",
          "f": "navy",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "第三层",
        "accent": "orange",
        "lines": [
         "连换个算子为什么也不行？",
         {
          "s": "算子本身是收缩的。",
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "与第二卷的对照",
        "accent": "purple",
        "lines": [
         {
          "pre": "第二卷　",
          "s": "重正化群递推假定为一阶，因此没有记忆",
          "pf": "purple"
         },
         {
          "pre": "第一卷　",
          "s": "世界式推断为二阶，有两个初值",
          "pf": "purple"
         },
         {
          "s": "同一件数学事实，在两份材料里扮演相反的角色。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 同一个式子的两种命运",
    "head": "第三章 · 同一个式子的两种命运",
    "sub": "差别只有一处：门开着，还是门关上了",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判别树要问的四个问题",
        "accent": "blue",
        "lines": [
         "可区分事物的个数增加了、不变、还是减少了？",
         {
          "s": "那个「新东西」是凭空产生的，还是由外部送进来的？",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig07-curves.png",
        "maxH": 150,
        "caption": "图 7　同一个递推式的两种命运。"
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "关键推论",
        "accent": "orange",
        "lines": [
         {
          "s": "不是两个模型，是同一个模型的两种边界条件。",
          "w": 700,
          "f": "navy"
         },
         "一个在门开着时算，一个在门关上之后算。"
        ]
       },
       {
        "k": "card",
        "title": "决定命运的参数",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "是「外部输入里有没有新的可区分性」，",
          "w": 700,
          "f": "navy"
         },
         "不是「外部输入的强弱」。"
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "封闭之后为什么必然归零",
    "head": "封闭之后为什么必然归零",
    "sub": "一个五步证明，和它最弱的一步",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "六个前提",
        "accent": "blue",
        "lines": [
         {
          "pre": "P1　",
          "s": "状态量是差别度 D",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "P2　",
          "s": "系统内部只有收缩算子",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "P3　",
          "s": "系统被封闭",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "P4　",
          "s": "同化算子不可逆",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "P5　",
          "s": "D 有下界 0",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "P6　",
          "s": "效力不衰减（本院的补充假设）",
          "pf": "red",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "五步",
        "accent": "teal",
        "lines": [
         "一、D 单调不增。",
         "二、D 有下界。",
         "三、由判据一，D 收敛。",
         "四、排除极限大于零。",
         {
          "s": "五、结论：唯一吸引子是零。",
          "f": "navy",
          "w": 700
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "最容易被攻的位置",
        "accent": "red",
        "lines": [
         {
          "s": "第四步依赖 P2 的内容与 P6，这是全证明最弱的一步。",
          "w": 700,
          "f": "red",
          "sz": 13
         },
         {
          "s": "本院对 P6 的辩护实质是「没有找到反证」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "三种反驳与本院回应",
    "head": "三种反驳与本院回应",
    "sub": "本院请读者攻这一页",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "反驳一",
        "badge": {
         "s": "回应强",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "封闭系统可以永远动下去。",
         {
          "s": "让 D 归零的是 P2，不是 P3。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "反驳二",
        "badge": {
         "s": "回应弱",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         "D 可能根本不是一个数。",
         {
          "s": "承认；只有两条弱支持。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "反驳三",
        "badge": {
         "s": "回应中",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "零不动点不是必然的。",
         {
          "s": "证明只能给出「收敛到下界」。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "第三卷问过同一个问题的另一种版本：提瓦特的不动点为什么是零？",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "终末是被合并，不是被毁灭",
    "head": "终末是被合并，不是被毁灭",
    "sub": "三处原文落点，与四条不能推出的东西",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三处落点",
        "accent": "teal",
        "lines": [
         "「连甜甜花和薄荷都长不出来的世界」",
         "胎海把异物「滤除」——是分出，不是打散。",
         {
          "s": "生命在其中「不分彼此」——是合并，不是消失。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig08-threelayers.png",
        "maxH": 150,
        "caption": "图 8　同一个方程在三个抽象层级上的投影。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "不能推出",
        "accent": "red",
        "lines": [
         "不能推出终末是温和的；不能推出它是瞬间发生的。",
         {
          "s": "不能推出「终末之后没有东西存在」——恰恰相反：东西都在，只是没有区别了。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "10-vol1a"
 },
 {
  "pages": [
   {
    "title": "第四章 · 三层结构",
    "head": "第四章 · 三层结构",
    "sub": "同一个方程在三个抽象层级上的投影",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "动力层",
        "badge": {
         "s": "乙",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         "D 在封闭系统中单调衰减。",
         {
          "s": "它管结局，管不了过程。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "逻辑层",
        "badge": {
         "s": "丙",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         "系统内必然存在不可判定命题。",
         {
          "s": "它管路上的可能性，管不了结局。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "元层",
        "badge": {
         "s": "甲",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "只有系统之外能改方程的参数。",
         {
          "s": "它管结局能否被改写。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "一个只有算术的世界里不会出现「漏洞」「判定者」「磨损」这三个词。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.1 动力层：差别的收支表",
    "head": "动力层：它能解释什么，不能解释什么",
    "sub": "解释不了的东西并不杂乱，它们属于同一类",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "能",
        "accent": "teal",
        "lines": [
         "终末「长不出甜甜花和薄荷」——差别消失而非物质消失。",
         {
          "s": "反复推演结果恒定——唯一吸引子。",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "不能",
        "accent": "red",
        "lines": [
         "有人能「卡漏洞」并长期得利。",
         "四影会逐渐偏离天理；天理需要「磨损」。",
         {
          "s": "「规格」这条界限；「死之诅咒」。",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "它们全都属于同一类：关于规则本身的现象。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.1 动力层的三条使用纪律",
    "head": "动力层的三条使用纪律",
    "sub": "一条好用的层，边界也必须写清楚",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "纪律一",
        "accent": "blue",
        "lines": [
         "结论只在边界之内有效。",
         {
          "s": "D* = 0 说的是蛋壳之内。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "纪律二",
        "accent": "blue",
        "lines": [
         "不因当事人的强弱而改变。",
         {
          "s": "算子对所有人一视同仁。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "纪律三",
        "accent": "blue",
        "lines": [
         "可计算，因此可以被核对。",
         {
          "s": "一条不能被别人复算的推演，等于没有。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "雷内算它、天理维持它、旅行者走进它，算子都不变。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.2 逻辑层：三个前提",
    "head": "逻辑层：哥德尔定理的三个前提",
    "sub": "结论是条件句，不是无条件句",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "前提与它们的失败",
        "accent": "purple",
        "lines": [
         {
          "pre": "一　",
          "s": "足够复杂　　历法、工程、科学院　乙",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "二　",
          "s": "自洽　　四百年无矛盾　丙（假设）",
          "pf": "red",
          "sz": 13
         },
         {
          "pre": "三　",
          "s": "递归可公理化　　教令院的列举　乙",
          "pf": "blue",
          "sz": 13
         },
         {
          "s": "任一个前提失效，它整条失效。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig09-godel.png",
        "maxH": 150,
        "caption": "图 9　系统内 vs 系统外。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "这是一条工程近似，不是一条定理条件。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "定理条件不成立，结论就不成立；工程近似失效，结论只是暂时可用。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.2 逻辑层能解释什么",
    "head": "逻辑层能解释什么、不能解释什么",
    "sub": "但有一件事它做不到",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "能",
        "accent": "teal",
        "lines": [
         "有人能「卡漏洞」并长期得利。",
         "四影会逐渐偏离天理。",
         {
          "s": "世界树可被改写、某个席位被抹除。",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "不能",
        "accent": "red",
        "lines": [
         "圣剑为什么有效。",
         "降临者为什么能改结果。",
         {
          "s": "雷内为什么选了那条路。",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "逻辑层的天花板",
        "accent": "orange",
        "lines": [
         {
          "s": "它改不了不动点。",
          "w": 700,
          "f": "navy",
          "sz": 16
         },
         {
          "s": "跨卷提示：第二卷第三章讨论「不可重正化」时，说的是同一件事的另一种版本。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.3 元层：降临者层",
    "head": "元层：降临者层",
    "sub": "第一句就确定了它改的是什么",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三句话",
        "accent": "gold",
        "lines": [
         {
          "s": "改的是输入值，不是算式。",
          "w": 700,
          "f": "navy"
         },
         "从外面来的东西很多，只有具备特定性质的才算「变量」。",
         {
          "s": "那个性质是「自身等价一个世界」。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig10-descender.png",
        "maxH": 150,
        "caption": "图 10　降临者不是方程里的未知数，是方程外的参数。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "世界式对降临者无解。",
          "w": 700,
          "f": "red",
          "sz": 16
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.3 两代降临者，两档操作",
    "head": "两代降临者，两档操作",
    "sub": "强度是动力层的语言，账户归属才是元层的判据",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一降临者",
        "badge": {
         "s": "改方程",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         "用蛋壳隔绝宇宙。",
         "把光界力改造成人界力。",
         {
          "s": "改的是边界与算子。",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "第四降临者",
        "badge": {
         "s": "改输入",
         "c": "blue"
        },
        "accent": "blue",
        "lines": [
         "「最早填入『世界式』的输入值出现了变动」",
         {
          "s": "只是在方程里填了一个新的数。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "一个强到极点的系统内存在，仍然只是逻辑层的一位访客。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.4 三层之间的关系",
    "head": "三层之间的关系",
    "sub": "还有一条纪律：不能越级提问",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "能否改变 D*",
        "accent": "blue",
        "lines": [
         {
          "pre": "动力层　",
          "s": "不能",
          "pf": "red"
         },
         {
          "pre": "逻辑层　",
          "s": "不能",
          "pf": "red"
         },
         {
          "pre": "元层　",
          "s": "能",
          "pf": "teal"
         }
        ]
       },
       {
        "k": "card",
        "title": "能解释卡漏洞吗",
        "accent": "purple",
        "lines": [
         {
          "pre": "动力层　",
          "s": "不能",
          "pf": "red"
         },
         {
          "pre": "逻辑层　",
          "s": "能",
          "pf": "teal"
         },
         {
          "pre": "元层　",
          "s": "不能",
          "pf": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "能解释降临者吗",
        "accent": "gold",
        "lines": [
         {
          "pre": "动力层　",
          "s": "不能",
          "pf": "red"
         },
         {
          "pre": "逻辑层　",
          "s": "不能",
          "pf": "red"
         },
         {
          "pre": "元层　",
          "s": "能",
          "pf": "teal"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三层结构自己的合成结果",
        "badge": {
         "s": "预测 · 丙级",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         {
          "s": "只靠系统内部的超越者，最多让系统出错；只靠系统外部的降临者，最多换一个初始项。",
          "sz": 13
         },
         {
          "s": "两者联手，才可能重写整个方程。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.5 分层判据",
    "head": "分层判据：一个现象该挂在哪一层",
    "sub": "本院见过的大部分误读，都发生在越级提问里",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三个追问",
        "accent": "blue",
        "lines": [
         "有没有出现「规则」「允许」「违规」「判定」这类词？",
         {
          "s": "是在规则之内做了一件规则没写的事，还是规则本身被换掉了？",
          "sz": 13
         },
         {
          "s": "动手的人是系统里面的，还是系统外面的？",
          "sz": 13
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig11-conceptmap.png",
        "maxH": 150,
        "caption": "图 11　概念关系图。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "最容易犯的挂错",
        "accent": "red",
        "lines": [
         {
          "s": "把「降临者很强」挂到元层。",
          "w": 700,
          "f": "red"
         },
         {
          "s": "强度是动力层的语言，账户归属才是元层的判据。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "4.6 本章的边界、反例与被推翻条件",
    "head": "4.6 本章的边界、反例与被推翻条件",
    "sub": "三层结构解释得多，预测得少",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条边界",
        "accent": "red",
        "lines": [
         "一、若前提二（自洽）失效。",
         "二、若出现第三种力。",
         "三、若出现一个在系统内部改写了不动点的例子。",
         {
          "s": "四、若「元层」其实在系统之内。",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "本院自评（一句话）",
        "accent": "orange",
        "lines": [
         {
          "s": "三层结构是本院目前最满意的框架，",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "也是本院目前最没有被检验过的框架。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "按 8.2 节的标准，这不是优点。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 四个推理案例",
    "head": "第五章 · 四个推理案例",
    "sub": "它不是四个证明，它是四次解释",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四个案例",
        "accent": "blue",
        "lines": [
         "一、为什么算出的终末是恒定的。",
         "二、为什么古教团的循环模型失效了。",
         "三、为什么那把剑是有效的。",
         {
          "s": "四、为什么变量必须是降临者。",
          "sz": 13
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig12-cases.png",
        "maxH": 150,
        "caption": "图 12　四个推理案例。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院把这件事摆在表的正中间",
        "accent": "gold",
        "lines": [
         {
          "s": "四个案例全部是回溯。",
          "w": 700,
          "f": "navy",
          "sz": 15
         },
         {
          "s": "解释得通与证明得了，是两件事。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "案例一与案例二",
    "head": "案例一、案例二：不是命运，也不是矛盾",
    "sub": "两个看起来最像「证明」的案例",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "案例一 · 结果恒定",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "不是命运，是唯一吸引子的必然表现。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "它改变了当事人的处境：只要改算子或改输入，结局就会变。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "案例二 · 同式两解",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "两个模型不矛盾，是同一道题的两组边界条件。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "「已经」两个字，是整条时间线的锚点。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "本院一直以为必有一方算错了；现在知道，两人都对，只是不在同一个时代。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "案例三与案例四",
    "head": "案例三、案例四：不是杀伤，不是更强",
    "sub": "两次把奇迹换成算术",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "案例三 · 那把剑",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "不是杀死他，而是撤销他的加速。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "支撑那个位阶的差别预算被撤走了。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig13-quadrants.png",
        "maxH": 140,
        "caption": "图 13　意志四象限。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "案例四 · 变量必须是降临者",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "不是因为降临者更强，而是因为他的差别预算不在系统内。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "他的特殊性不在强度，在账户归属。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "5.5 四案例横向对照表",
    "head": "四案例横向对照表",
    "sub": "最该被记住的是方向与等级两行",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四句话的结论",
        "accent": "blue",
        "lines": [
         {
          "pre": "一　",
          "s": "不是命运，是唯一吸引子",
          "pf": "teal"
         },
         {
          "pre": "二　",
          "s": "不是矛盾，是两组边界条件",
          "pf": "teal"
         },
         {
          "pre": "三　",
          "s": "不是杀伤，是撤销",
          "pf": "teal"
         },
         {
          "pre": "四　",
          "s": "不是更强，是账户在外",
          "pf": "teal"
         }
        ]
       },
       {
        "k": "card",
        "title": "方向与等级",
        "accent": "gold",
        "lines": [
         {
          "pre": "方向　",
          "s": "回溯（四个都是）",
          "pf": "blue",
          "w": 700
         },
         {
          "pre": "等级　",
          "s": "乙（案例三的事实部分为甲）",
          "pf": "gold"
         },
         {
          "s": "乙级的含义是「需要一步翻译」；翻译错了，案例就错了。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "5.6 本章的边界 + 第六章",
    "head": "本章的边界，与一本使用教程",
    "sub": "四条边界，六步流程",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "5.6 四个案例共同依赖什么",
        "accent": "red",
        "lines": [
         "D 必须是正确的状态量。",
         "系统必须真的封闭。",
         {
          "s": "两种底层力必须都是收缩的。",
          "sz": 13
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig14-tutorial.png",
        "maxH": 150,
        "caption": "图 14　世界式使用教程：六步流程。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "6.1 六步流程",
        "accent": "blue",
        "lines": [
         "划定系统边界；找出初始项；判断算子类型。",
         {
          "s": "查内源；推演终末；定位变量。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "6.2 判别树",
    "head": "判别树：这个方案在加速终末吗",
    "sub": "六个最容易犯的错误从一个问题开始",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判别树问的从来不是式子",
        "accent": "orange",
        "lines": [
         "它不回答「世界式是什么」，",
         {
          "s": "它只回答「在某个具体情形下，密合是哪一种」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig15-decisiontree.png",
        "maxH": 190,
        "caption": "图 15　判别树。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "6.6 本教程的边界与被推翻条件",
        "accent": "red",
        "lines": [
         {
          "s": "同一个式子在不同边界条件下给出不同的答案；判别树问的从来是边界。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论一 · 火候就是 D(t) 的极大值",
    "head": "补论一 · 火候就是 D(t) 的极大值",
    "sub": "一道传了几百年的家常菜，和一道公式是同一种东西",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三段",
        "accent": "teal",
        "lines": [
         {
          "pre": "上升　",
          "s": "生成型密合占上风，D 上升",
          "pf": "teal"
         },
         {
          "pre": "峰值　",
          "s": "生成速率与坍缩速率相等",
          "pf": "gold"
         },
         {
          "pre": "下降　",
          "s": "新差别不再产生，D 趋向 0",
          "pf": "red"
         },
         {
          "s": "鼻子做的不是玄学判断，它在实时测量 D 的一阶导数。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig16-cooking-curve.png",
        "maxH": 165,
        "caption": "图 16　甜甜花酿鸡的 D(t) 轨迹。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "峰值两边是不对称的",
        "accent": "orange",
        "lines": [
         {
          "s": "欠火是可逆的，过火是不可逆的——一边是「还没到」，另一边是「已经没了」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论一 · 两个「2」与记忆项",
    "head": "两个「2」是怎么来的",
    "sub": "一个数的是原料的味数，一个数的是份数",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两个「2」",
        "accent": "blue",
        "lines": [
         {
          "pre": "第一个　",
          "s": "两味原料（四象限 4 ÷ 2）",
          "pf": "blue"
         },
         {
          "pre": "第二个　",
          "s": "每味两份（迭代两次）",
          "pf": "blue"
         },
         {
          "s": "它们不能互相顶替。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig17-recipe-quadrants.png",
        "maxH": 150,
        "caption": "图 17　两味原料填满四个象限。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "与第二卷的记忆项",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "一阶递推没有记忆项，因此它没有地方安放引力。",
          "sz": 13
         },
         {
          "s": "本院只主张两处在结构上同形，不主张是同一个机制。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论一 · 十二、本补论的边界",
    "head": "补论一 · 本补论的边界",
    "sub": "以厨房为准，改方程的应用方式",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "关于知识",
        "accent": "teal",
        "lines": [
         "结构与算子同形。",
         {
          "s": "本院没有主张厨师知道这套数学。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "关于机制",
        "accent": "teal",
        "lines": [
         "两边可以用同一套语言描述。",
         {
          "s": "本院没有主张两边是同一个物理机制。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "关于精度",
        "accent": "red",
        "lines": [
         "能给出方向、排序与格子。",
         {
          "s": "给不出确切的分钟数与克数。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "厨房是可验证的那一侧，方程是可改写的那一侧——这是整套方法里最不可让步的次序。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "11-vol1b"
 },
 {
  "pages": [
   {
    "title": "补论二 · 弹性从哪来",
    "head": "补论二 · 泡泡糖的弹性是从哪来的",
    "sub": "一个只有外来者才问得出来的问题",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两种视角",
        "accent": "purple",
        "lines": [
         {
          "pre": "研究员　",
          "s": "没有异常——弹性是常态",
          "pf": "blue"
         },
         {
          "pre": "偷渡客　",
          "s": "缺了胶基——弹性是结果",
          "pf": "red"
         },
         {
          "s": "外部视角带来的不是更多知识，是一个不同的默认值。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig18-gumbase-source.png",
        "maxH": 150,
        "caption": "图 18　现实世界与提瓦特的泡泡糖原料来源对照。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "gold",
        "lines": [
         {
          "s": "六行里五行都有替代物，只有一行没有——而那一行正好是唯一通向他乡地质史的。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论二 · 弹性与记忆项",
    "head": "弹性：为什么「还回来」需要记得原来的样子",
    "sub": "一阶的网没有记忆项，因此它没有地方安放「原来的形状」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "弹性体与塑性体",
        "accent": "teal",
        "lines": [
         "弹性体与塑性体的差别，只差在「回不回得来」。",
         {
          "s": "两条路径一模一样，回程不一样。",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig19-elasticity-vs-assimilation.png",
        "maxH": 145,
        "caption": "图 19　弹性与同化的区别：去程与回程。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "与第二卷的记忆项",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "本院只主张两者都要求「当前状态之外还有一项在起作用」。",
          "sz": 13
         },
         {
          "s": "十、本补论的边界：它把一个文本问题变成了一件可以被做出来的事。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论三 · 五条人口约束",
    "head": "补论三 · 枫丹廷最多能容纳多少人",
    "sub": "四条约束是一组「与」的关系，不是四个分数",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条老约束 + 一条新约束",
        "accent": "blue",
        "lines": [
         "空间、秩序、粮食、能量、水。",
         {
          "s": "任何一条到顶，人口就到顶。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "只要有一条卡得很死，其余三条再宽裕也没有用。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig20-population-limits.png",
        "maxH": 150,
        "caption": "图 20　枫丹廷的五条人口约束。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "解释可以改，数字不能改——一旦本院写下「约 2 万」，它就得站在那里。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论三 · D 维持费与反项",
    "head": "D 维持费与第二卷的反项：同一件事的两种语言",
    "sub": "世界上没有免费的「保持不变」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "在枫丹廷，这笔维持费是行政",
        "accent": "teal",
        "lines": [
         "行政就是 D 的维护工人。",
         {
          "s": "铁匠停工会少掉铁器，法官停工会让所有人都变成「一样的人」。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig21-feedback-loop.png",
        "maxH": 145,
        "caption": "图 21　律偿混能的反馈环。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "「封闭」不是一个免费的初始条件，而是一笔每年都要付的账。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "在物理里这笔账的名字叫反项，在枫丹廷这笔账的名字叫公文。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论四 · 灾难间隔按 1/φ² 收缩",
    "head": "补论四 · 为什么灾难间隔按 1/φ² 收缩",
    "sub": "一场灾难 = 两步",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四步",
        "accent": "gold",
        "lines": [
         "取模：把 −1/φ 那一项当成一个小量。",
         "数一场灾难有几步：两步。",
         {
          "s": "把两步乘起来：(1/φ)² ≈ 0.382。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "为什么是两步",
        "accent": "blue",
        "lines": [
         "依据是四象限的两条轴是配成对的。",
         {
          "s": "「步」不对应固定的年数：步是结构上的单位，年是史料的单位。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "如果 a ≠ b，φ、1/φ²、0.382、1.618 全部作废。",
          "w": 700,
          "f": "red",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论四 · 公式白送的两个量",
    "head": "公式白送的两个量：73 年与 427 年",
    "sub": "这两个量不含任何史料成分",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "从公式里直接推出来",
        "accent": "gold",
        "lines": [
         {
          "pre": "下一个量　",
          "s": "1/(1−r)，给出 73 年",
          "pf": "gold"
         },
         {
          "pre": "再下一个　",
          "s": "间隔 292 年",
          "pf": "gold"
         },
         {
          "s": "全部灾难在 +427 年处汇聚。那个汇聚点就是终末——D = 0。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig22-cascade.png",
        "maxH": 165,
        "caption": "图 22　世界式给出的灾难级联。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "史料只贡献了两个刻度；其余全部是公式自己给的。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论四 · 公式裁决年代争议",
    "head": "公式裁决了一桩年代争议",
    "sub": "一个只用自身比例就能裁决史料的公式",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "公式要求",
        "accent": "orange",
        "lines": [
         {
          "s": "相邻两次灾难间隔的比值必须是 0.382。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "假设甲算出的比值 0.375，与公式要求吻合到 2%。",
          "sz": 12.5
         },
         {
          "s": "假设乙算出 1.50，方向甚至相反。",
          "sz": 12.5,
          "f": "red"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig23-adjudication.png",
        "maxH": 145,
        "caption": "图 23　用世界式裁决年代争议。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "十二、怎样才能推翻这个预测",
        "accent": "red",
        "lines": [
         {
          "s": "若观察到的相邻灾难间隔比显著偏离 0.382，或 200 年内无大灾难，则模型被推翻。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论五 · 两种「失去」",
    "head": "补论五 · 世界式里其实有两种「失去」",
    "sub": "它禁止了一种「回来」，从来没有禁止另一种",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "密合与隔绝",
        "accent": "teal",
        "lines": [
         {
          "pre": "密合　",
          "s": "把两样东西变成一个，D 真的降了",
          "pf": "red"
         },
         {
          "pre": "隔绝　",
          "s": "只是加了一道墙，D 一点没动",
          "pf": "blue"
         },
         {
          "s": "蛋壳不消灭差别，它切断通路。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig24-two-kinds-of-loss.png",
        "maxH": 150,
        "caption": "图 24　两种完全不同的「失去」。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "由蛋壳造成的一切「失去」，在 D 的账上一分都没扣。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "补论五 · 四个象限一个都没少",
    "head": "她能回来，是因为四个象限一个都没少",
    "sub": "「第二次出生」——出生不是复活",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两栏对照",
        "accent": "teal",
        "lines": [
         {
          "pre": "哥伦比娅　",
          "s": "四格俱在",
          "pf": "teal"
         },
         {
          "pre": "白淞镇死者　",
          "s": "四格俱空",
          "pf": "red"
         },
         {
          "s": "前三个格子是「能不能」，第四个是「会不会」。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig25-quadrants-compare.png",
        "maxH": 150,
        "caption": "图 25　四象限对照。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "补记三：还有第三个条件——地脉认不认",
        "accent": "purple",
        "lines": [
         {
          "s": "回到地脉不是自动的，是有门槛的。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯一 · 规格＝D 的上限",
    "head": "回溯一 ·「规格」：一条刻在万物之中的界限",
    "sub": "甜甜花在 12~14 倍处骤降归零",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "翻译：规格就是 D 的上限",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "每一株植物都有一条自己的界限。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "本次长到 16 倍以上的，其实是另一种植物。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig26-spec-limit.png",
        "maxH": 150,
        "caption": "图 26　「规格」：每一株植物都有一条自己的界限。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "与第二卷第七章的对照",
        "accent": "orange",
        "lines": [
         {
          "s": "规格对应物理里的紫外截断 Λ。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯一 · 三个性质与推翻条件",
    "head": "规格的三个性质，与九、什么情况下这一篇会被推翻",
    "sub": "最要紧的一句：失败证明界限的稳定",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三个性质",
        "accent": "teal",
        "lines": [
         "普遍：万物皆有。",
         "分对象：各是各的。",
         {
          "s": "可被抬高：界限会动。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig27-spec-properties.png",
        "maxH": 150,
        "caption": "图 27　「规格」的三个性质。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "九、什么情况下这一篇会被推翻",
        "accent": "red",
        "lines": [
         {
          "s": "若无外源也能无限增长而不崩，则「规格＝D 的上限」作废。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯一之二 · 死之诅咒",
    "head": "回溯一之二 ·「死之诅咒」：一个阻止差别增加的机构",
    "sub": "「不会」与「不许」为什么互为对方的解释",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "原文三句话",
        "accent": "purple",
        "lines": [
         {
          "s": "「确保死亡的发生」——它保证 D 单调下降。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "它是被刻意装上的机构，不是自发的同化。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它与规格的关系",
        "accent": "teal",
        "lines": [
         "规格管上限，死之诅咒管不许增加。",
         {
          "s": "两条材料合起来，还缺一个名字。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "七、什么情况下这一篇会被推翻",
        "accent": "red",
        "lines": [
         {
          "s": "若发现存在不导致 D 下降的死亡形式，本条作废。",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯二 · 归约：为什么这不是撤销",
    "head": "回溯二 ·「归约」：世界式的逆运算",
    "sub": "原文给出了一个术式、一个名字、一个用途",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "密合不是一一对应",
        "accent": "purple",
        "lines": [
         "密合是多对一：从 7 去找它的两个来源，",
         {
          "s": "不是在解一道难题，而是在做一道没有答案的题。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig28-three-operations.png",
        "maxH": 150,
        "caption": "图 28　三档操作。前两档处理「合并」，第三档处理「结构」。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "归约取的是一张截面（右逆），有损 δ′ < δ。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "「原像不唯一，取哪个都可以」——这句话本院要收回一半。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯二 · 三档操作与地脉",
    "head": "回溯二 · 三档操作与「地脉是银行」",
    "sub": "第三档是唯一可持续的一档",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一档 密合",
        "accent": "red",
        "lines": [
         "重复的前提已经没了。",
         {
          "s": "归零之后没有可归的东西。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二档 归约",
        "accent": "orange",
        "lines": [
         "像抽水：每次都能抽。",
         {
          "s": "收回成本不是利润。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三档 人格分离",
        "accent": "teal",
        "lines": [
         "它不动本金。",
         {
          "s": "结构还在，账上的数没变。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "六、地脉是银行，不是熔炉",
        "accent": "gold",
        "lines": [
         "每天地脉能够接收的灵魂数量有着明确的限制。",
         {
          "s": "地脉有账本、有额度、有亏空要补——它是一个不归零的仓库。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯三 · 外源是一个可以空着的座位",
    "head": "回溯三 · 外源是一个可以空着的座位",
    "sub": "「参数是一个值」，只能问它等于多少",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "变量位这个提法比原来的更准",
        "accent": "teal",
        "lines": [
         {
          "s": "「外源是一个位」，可以问它什么时候有人。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "原文用的六个字是「已碎，陷入沉寂」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig29-variable-slot.png",
        "maxH": 150,
        "caption": "图 29　变量位时间表。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "十、边界",
        "accent": "red",
        "lines": [
         {
          "s": "「变量位」这个提法来自观众，不是原文。",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "回溯三 · 两代降临者与阿克西妮娅",
    "head": "回溯三 · 两代降临者，与一个微缩的法涅斯",
    "sub": "世界式是边界与算子这一层的算术",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两种操作层次",
        "accent": "blue",
        "lines": [
         "第一降临者改的是边界与算子。",
         {
          "s": "第四降临者改的是输入值。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "世界式对降临者无解。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "阿克西妮娅：一个微缩的法涅斯",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         "天理的截断是一道边界，边界不会说话。",
         {
          "s": "而她的壳子里有一个人在做筛选。",
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "八、对补论四的一处修正",
        "accent": "red",
        "lines": [
         {
          "s": "「73 年」仍然是一个合法的条件句——只是它的前提现在写明了。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 雷内方案复盘",
    "head": "第七章 · 雷内方案复盘",
    "sub": "他不是算错了。他算对了",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "他做对了什么",
        "accent": "teal",
        "lines": [
         "他怀疑了结论，也找到了方向，",
         {
          "s": "然后在这两者之间拐错了弯。",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "fig30-rene-audit.png",
        "maxH": 150,
        "caption": "图 30　雷内的每一个「救世」动作，在方程里的实际效果。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三条错误的总表",
        "accent": "red",
        "lines": [
         "一、想把「改变输入」做成「成为不动点」。",
         "二、用收缩算子去造一个有差别的宇宙。",
         {
          "s": "三、把加快坍缩当成了对抗坍缩。",
          "w": 700,
          "f": "red",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 二十条全部是回溯",
    "head": "第八章 · 全部结论的分级总表",
    "sub": "这张表最刺眼的一列是「方向」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "8.1之二 的分级总表",
        "accent": "gold",
        "lines": [
         {
          "s": "二十条全部是回溯。",
          "w": 700,
          "f": "navy",
          "sz": 16
         },
         {
          "s": "这不是排版错误，是本院的研究现状。",
          "sz": 13,
          "f": "muted"
         },
         {
          "pre": "等级　",
          "s": "甲级 10、乙级 6、丙级 4",
          "pf": "blue",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "8.2 推理的方向性",
        "accent": "blue",
        "lines": [
         {
          "pre": "回溯　",
          "s": "先见证据，后接框架",
          "pf": "blue"
         },
         {
          "pre": "预测　",
          "s": "先有结论，后找证据",
          "pf": "red"
         },
         {
          "s": "本纪要唯一的两条预测都是丙级。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "判断一份研究是不是还在动，看它有没有为「解释不了的东西」付出过代价。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 三个反例与三条建议",
    "head": "第八章 · 三个反例、登记表与三条建议",
    "sub": "本院把最容易攻的排在第一位",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "8.3 三个可能的反例",
        "accent": "red",
        "lines": [
         "反例一：如果存在第三种力。",
         "反例二：如果蛋壳并未完全封闭。",
         {
          "s": "反例三：如果 D 不是正确的状态量。",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "8.5 对后续研究的三条建议",
        "accent": "teal",
        "lines": [
         "一、优先寻找第三种力。",
         "二、建立差别度的可测量代理指标。",
         {
          "s": "三、把「是否在合并差别」加入评估清单。",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "排序的理由不是重要性，而是「现在做得了做不了」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "本院不用「好像没毛病」评价任何东西，包括自己的稿子。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第九~十章 · 三条对照与七个问题",
    "head": "第九、十章 · 三条对照与七个问题",
    "sub": "一个类比如果推不出任何东西，它就只是修辞",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "与熵增原理",
        "accent": "blue",
        "lines": [
         "骨架相同，驱动力不同。",
         {
          "s": "「散了」与「化了」留下的是不同的痕迹。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "与博弈论",
        "accent": "purple",
        "lines": [
         "都让人找不到可以指责的对象。",
         {
          "s": "看它改的是收益矩阵还是算子。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "与生物演化",
        "accent": "teal",
        "lines": [
         "变异是产生新性状的唯一来源。",
         {
          "s": "单一化的种群不是灭绝——它还在。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院最希望读者问的三个问题",
        "accent": "gold",
        "lines": [
         {
          "s": "你这条结论，什么情况下会被推翻？",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "你这台算式，有没有算错过一次？",
          "sz": 13
         },
         {
          "s": "如果 D 等于零，对你来说损失了什么？",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "12-vol1c"
 },
 {
  "pages": [
   {
    "title": "第二卷 · 大一统：一个缺失的项",
    "head": "第二卷 · 大一统：一个缺失的项",
    "sub": "从两个并排写下的式子出发",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本卷要问的问题",
        "accent": "purple",
        "lines": [
         {
          "s": "如果引力的麻烦，恰好来自「重正化群是一阶的」呢？",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "本卷的甲级是空的。这不是谦虚，是实情。",
          "sz": 13,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU01-mindmap.png",
        "maxH": 165,
        "caption": "图 U-1　第 48 号研究总览。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "一个一阶递推，没有任何位置可以安放第二个项——这就是本卷存在的理由。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第零章 · 两个式子并排写下来",
    "head": "第零章 · 两个式子并排写下来",
    "sub": "注意到的不是它们的相似，而是它们的一个差别",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两个式子",
        "accent": "blue",
        "lines": [
         {
          "s": "dg / d ln μ = β(g)",
          "mono": true,
          "sz": 15,
          "f": "gold",
          "w": 700
         },
         {
          "s": "g(n+1) = g(n) + ε·β(g(n))",
          "sz": 13,
          "f": "muted"
         },
         {
          "s": "W(n+1) = W(n) ⊕ W(n−1)",
          "mono": true,
          "sz": 15,
          "f": "gold",
          "w": 700
         },
         {
          "s": "第一个右边只有 g(n)；第二个右边还有前一项。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU02-two-recursions.png",
        "maxH": 165,
        "caption": "图 U-2　两个式子并排：差的是一阶。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "耦合常数不是常数——一种力有多强，取决于你在什么尺度上问它。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第零章 · 阶：这个差别叫什么",
    "head": "第零章 · 阶：这个差别叫什么",
    "sub": "阶数不是一个小差别",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四个后果",
        "accent": "teal",
        "lines": [
         "二阶递推的解是两族解之和。",
         "两族解的相对权重是随步数变化的。",
         {
          "s": "第二族解可以先被压制、后在某个区间里跑出来。",
          "sz": 12.5,
          "f": "navy"
         },
         {
          "s": "一阶递推没有位置安放第二个项。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "借了第一卷哪几个词",
        "accent": "purple",
        "lines": [
         "「递推的阶」不是本院自造的词。",
         {
          "s": "「记忆项」不是——本院在附录 A 里把它登记为自己的命名的。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "借词有一个特有的危险：它会带着原词的全部直觉一起搬过来。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第零章 · 本纪要要问的问题",
    "head": "第零章 · 本纪要要问的问题",
    "sub": "这个后果太软——但本院还是把它写下来",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "如果猜想成立",
        "accent": "blue",
        "lines": [
         "给递推加一项；给基本对象加一个延展的方向。",
         "给几何加一个最小台阶；给发散找一个非零的落脚点。",
         {
          "s": "四条路线各自的样子，其实是同一句话的四种写法。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "本卷的分级与方向怎么用",
        "accent": "orange",
        "lines": [
         {
          "s": "本卷的甲级是空的。",
          "w": 700,
          "f": "orange"
         },
         {
          "s": "本院在 5.5 节与 9.2 节各说过一次「本院没有做任何计算」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "一条「无论哪条路线成功，都能被解释成本院说对了」的期望，不够格当预测。",
          "w": 700,
          "f": "red",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第零章 · 本章的边界",
    "head": "第零章 · 本章的边界",
    "sub": "本章提出的只是一个形状上的相似",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "它只是一个形状上的相似，不是一个推导。",
          "w": 700,
          "f": "navy",
          "sz": 15
         },
         {
          "s": "这个观察本身是廉价的。它有价值与否，取决于它能不能在后面的章节里长出可检验的东西。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "宁可把最容易被推翻的放在最前面",
        "accent": "teal",
        "lines": [
         "一个一眼可验的起点更适合放在第零章。",
         {
          "s": "因为它错了也容易发现。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "共用语言而不共用证据",
        "accent": "red",
        "lines": [
         "好处是第三卷可以拿两份材料互相解释。",
         "风险是本院可能只是因为两边的词长得像。"
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 一台递推机需要什么",
    "head": "第一章 · 一台递推机需要什么",
    "sub": "状态、转移规则、初值",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "状态",
        "accent": "blue",
        "lines": [
         "它现在是什么。",
         {
          "s": "转移规则读的是它的历史。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "转移规则",
        "accent": "teal",
        "lines": [
         "从现在的状态怎么走到下一个。",
         {
          "s": "「阶」描述的是它要看几步历史。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "初值",
        "accent": "gold",
        "lines": [
         "从哪里开始。",
         {
          "s": "选了初值，整条数列就跟上来了。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "阶不是一个「有或没有」的性质，它是一个数。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 递推规则 + 初值 = 整个数列",
    "head": "第一章 · 递推规则 + 初值 = 整个数列",
    "sub": "这条等式反过来读，就是一条推断工具",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一层",
        "accent": "blue",
        "lines": [
         "递推机没有自由意志。",
         {
          "s": "推一万遍还是这个结果。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二层",
        "accent": "teal",
        "lines": [
         "要改变未来，只能改两样东西之一。",
         {
          "s": "规则，或者开头。没有第三种可能。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三层",
        "accent": "gold",
        "lines": [
         "这条等式反过来读。",
         {
          "s": "暗示「开头有几项」，就暗示了阶数。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "第一卷第 4.3 节指出，降临者改的是开头：「最早填入『世界式』的输入值出现了变动。」",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 一阶递推：没有记忆的机器",
    "head": "一阶递推：没有记忆的机器",
    "sub": "它的未来只由现在决定，与过去无关",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "这不是一个缺陷",
        "accent": "teal",
        "lines": [
         "放射性衰变、牛顿冷却、RC 电路放电。",
         {
          "s": "它们也确实「不记得」自己之前走过什么路。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "在重正化群里",
        "accent": "blue",
        "lines": [
         {
          "s": "曲线怎么走，只取决于当前的耦合值，不取决于它从哪来。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "这是「普适性」的来源。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "「没有记忆」不等于「不可预测」——恰恰相反，它是可预测性的极致。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 「没有记忆」的三种检验",
    "head": "「没有记忆」的三种检验",
    "sub": "三种给出的答案永远一致",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "检验一 数下标",
        "accent": "blue",
        "lines": [
         "看右边出现的下标与左边相差几步。",
         {
          "s": "只出现 n，是一阶。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "检验二 数初值",
        "accent": "teal",
        "lines": [
         "需要预先知道几个数才能启动？",
         {
          "s": "优点是它不需要看式子。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "检验三 改历史实验",
        "accent": "gold",
        "lines": [
         "固定当前值，只改动更早的那一项。",
         {
          "s": "一阶系统不会变——规则读不到它。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "navy",
        "lines": [
         {
          "s": "第三种最值得记住，因为它给出了本卷核心问题的一个操作化版本。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 二阶递推：多出来的那一项",
    "head": "二阶递推：多出来的那一项",
    "sub": "区别不在每一步的形式上，而在可选项的数量上",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         {
          "s": "在标准模型里，重正化群的状态只有一个分量——当前耦合 g(n)。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "没有一个第二分量可以放进去，因为整个框架里不存在这样一个量。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "一阶与二阶的差别",
        "accent": "blue",
        "lines": [
         "给定同一批初值，一台一阶机器只有一条路可走。",
         {
          "s": "区别在于二阶机器多带了一个可以调节的分量。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "本卷最要紧的一句",
        "accent": "gold",
        "lines": [
         {
          "s": "多出来的那一项，本院称之为记忆项。",
          "w": 700,
          "f": "navy",
          "sz": 14
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 初值个数是数出来的",
    "head": "初值个数：数出来的，不是规定的",
    "sub": "同一条规则，因为开头两个数不同，长出了两条数列",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两条数列",
        "accent": "blue",
        "lines": [
         {
          "s": "1，1，2，3，5，8，…",
          "mono": true,
          "sz": 13,
          "f": "gold"
         },
         {
          "s": "2，1，3，4，7，11，…",
          "mono": true,
          "sz": 13,
          "f": "gold"
         },
         {
          "s": "只知道开头是 1，两条都符合规则。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "一条算术关系",
        "accent": "teal",
        "lines": [
         {
          "s": "初值个数 = 待定常数个数",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "= 特征方程根的个数 = 解的族数",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "数初值，可以反推阶数。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "「最早的」说明开头不止一项——这正是第一卷 2.3 节的第二条理由。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 特征方程与两族解",
    "head": "第一章 · 从特征方程看两族解",
    "sub": "六步走完，那条算术关系就闭合了",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "六步",
        "accent": "blue",
        "lines": [
         "一、只研究线性递推。",
         "二、试解 x(n) = rⁿ。",
         "三、代入；四、两边同除 r^(n−1)。",
         {
          "s": "五、解二次方程，得两个根。",
          "f": "navy"
         },
         {
          "s": "六、叠加，再定常数。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "闭合",
        "accent": "teal",
        "lines": [
         {
          "s": "两个根 → 两族解 → 两个待定常数 → 两个初值。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "这条链上的每一环都是同一件事的不同说法。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 判别式：两族解的三种情形",
    "head": "判别式：两族解的三种情形",
    "sub": "「振荡」这件事只出现在其中一行",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三种情形",
        "accent": "blue",
        "lines": [
         {
          "pre": "Δ > 0　",
          "s": "两个实根，一正一负",
          "pf": "blue"
         },
         {
          "pre": "Δ = 0　",
          "s": "两根重合，本卷用不到",
          "pf": "muted"
         },
         {
          "pre": "Δ < 0　",
          "s": "一对共轭复数 → 阻尼振荡",
          "pf": "orange",
          "w": 700
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU03-one-vs-two-roots.png",
        "maxH": 150,
        "caption": "图 U-3　一个根与两个根。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "一阶递推只有一个数，它只能表达「每步乘多少」，没有第二个数用来表达「每步转多少」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 第一卷那台算式的两个根",
    "head": "第一卷那台算式的两个根",
    "sub": "第五章要接的，正是这条线",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "代入",
        "accent": "blue",
        "lines": [
         "在生成型密合的情形下，第一卷补论四取 a = b = 1。",
         {
          "s": "这正是卢卡斯数列的规则。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "两个根各自意味着什么",
        "accent": "teal",
        "lines": [
         {
          "pre": "φ　",
          "s": "增长模 ≈ 1.618",
          "pf": "teal"
         },
         {
          "pre": "−1/φ　",
          "s": "衰减模 ≈ −0.618",
          "pf": "red"
         },
         {
          "s": "第一卷用它推出的两个数，第五章还会遇到。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "如果提瓦特那台机器把这两个数白送了出来，那么物理里那台机器为什么一个也送不出来？",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 比值与振荡",
    "head": "比值：最容易被观察的量",
    "sub": "一台递推机身上，最容易量到的量是什么",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "答案是比值",
        "accent": "blue",
        "lines": [
         {
          "s": "「相邻两项的比」是一个纯数。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "比值趋于主导根，需要时间。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "为什么二阶能震荡而一阶不能",
        "accent": "teal",
        "lines": [
         "一阶递推永不变号，或每步都变号。",
         {
          "s": "它的周期被锁死在 2，改不了。",
          "sz": 12.5
         },
         {
          "s": "二阶：判别式为负时，通解变成阻尼振荡。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 标准模型：一台一阶递推机的胜利",
    "head": "第二章 · 一台一阶递推机的胜利",
    "sub": "三种力被同一台递推机收进去了，第四种没有",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "它统一了什么",
        "accent": "teal",
        "lines": [
         {
          "s": "标准模型把三种相互作用写成了一个理论。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "「统一」在本卷里是一个可计算的收敛结果：三条曲线在高能标处靠近。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它是怎么赢的",
        "accent": "blue",
        "lines": [
         {
          "s": "把三种耦合常数分别沿能标往上跑，它们会靠近。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "这个「发现」不是瞬间的洞见，而是一台递推机的输出。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第四种没有",
        "accent": "red",
        "lines": [
         "引力是最先被写成一套完整几何理论的那一个。",
         {
          "s": "它没有被收进去，是因为把它放进去的时候，那台机器不会停车。",
          "sz": 12.5,
          "f": "red"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 耦合常数为什么能当成数列",
    "head": "耦合常数为什么可以被当成一个数列",
    "sub": "一个数只能表达一件事",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它付出的代价",
        "accent": "orange",
        "lines": [
         "状态少（一个数就够）、转移规则短、推演可以一直往前。",
         {
          "s": "这三件事合起来，就是「可算」。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "三条线为什么能画在同一张图上",
        "accent": "purple",
        "lines": [
         "它们共用同一个能标；各自只需要一个数。",
         {
          "s": "它们的转移规则只依赖当前值。",
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "如果某一种力的 β 函数需要读到自己的历史，那么它在图上就不再是一条线。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 它们「几乎」交汇",
    "head": "它们「几乎」交汇",
    "sub": "这是粒子物理里最有名的一张图",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "「几乎」的几种意思",
        "accent": "blue",
        "lines": [
         {
          "s": "本院把中间那一行称为「差一点的胜利」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "它为什么差这一点，图上看不出来。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU04-three-couplings.png",
        "maxH": 165,
        "caption": "图 U-4　三线「几乎」交汇。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "回溯 · 乙级",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "这张图上真正被测量过的部分，只在最左边那一小段。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 为什么是「几乎」",
    "head": "为什么是「几乎」",
    "sub": "超对称解释了一个已有的事实，而没有事先说中它",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两条路",
        "accent": "blue",
        "lines": [
         "在纯标准模型里，三条线不交汇。",
         {
          "s": "加上超对称，它们会交汇得漂亮得多。",
          "f": "navy"
         },
         {
          "s": "但超对称是在「三线不交汇」之后被引进来修这个问题的。",
          "sz": 12.5,
          "f": "orange"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU05-supersymmetry-retro.png",
        "maxH": 150,
        "caption": "图 U-5　回溯与预测。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "超对称本身做出的那些真正的预测——比如超对称粒子的质量——至今没有被找到。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 本院为什么对「回溯」这么苛刻",
    "head": "本院为什么对「回溯」这两个字这么苛刻",
    "sub": "回溯本身不是错误，被当成证据的回溯才是",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "因为任何框架都能容纳任何观察——只要允许它事后长出一个新章节。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "一个「什么都能解释」的框架，等于什么都没解释。而只有预测能被推翻。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本院必须承认一件事",
        "accent": "orange",
        "lines": [
         {
          "s": "本卷的绝大多数结论是回溯。",
          "sz": 13
         },
         "本章的评价与第三章的猜测，全是回溯。"
        ]
       },
       {
        "k": "card",
        "title": "所以",
        "accent": "teal",
        "lines": [
         {
          "s": "本章的每一条判断后面都跟着一句推翻条件。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "它们不是为了显得严谨——它们是为了让读者能反驳本院。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 外推与本章判断一览",
    "head": "一次十几个数量级的外推",
    "sub": "外推得越远，末端那一点差距的可靠性就越低",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "三条线的走法：在低能标处测出三个耦合的值，然后沿着各自的 β 函数往上算。",
          "sz": 13
         },
         {
          "s": "算出去的路径没有任何一处被直接核对过。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本章唯一一句超出复述的话",
        "accent": "gold",
        "lines": [
         {
          "s": "它的胜利与它的边界来自同一件事。",
          "sz": 13
         },
         {
          "s": "这句话现在还是一个类比。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三章会给出另一种写法",
        "accent": "purple",
        "lines": [
         "那里不再说「一阶」，而说「量纲」。",
         {
          "s": "同一个赌注的另一种写法。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 把「不可重正化」翻译成人话",
    "head": "第三章 · 把「不可重正化」翻译成人话",
    "sub": "负量纲的耦合常数意味着什么",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四步",
        "accent": "blue",
        "lines": [
         "一、把那一项的量纲算出来：L²。",
         "二、换成能量这把尺子，指数变成负的。",
         {
          "s": "三、从量纲到圈图：每多一个顶点，指数往下走 2。",
          "sz": 12.5
         },
         {
          "s": "四、反项够不够用，才是分界线。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "三句话把圈图的账算出来",
        "accent": "teal",
        "lines": [
         "每一个顶点带一个 G。",
         "每一个圈带来一个四维动量积分。",
         {
          "s": "收敛性不改善：圈数越多，发散越厉害。",
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "广义相对论在低能标上是一个极好的理论。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 一个类比：把这件事想成一笔贷款",
    "head": "一个类比：把这件事想成一笔贷款",
    "sub": "本院请读者注意它是类比",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两笔债",
        "accent": "gold",
        "lines": [
         {
          "pre": "可重正化　",
          "s": "每期都在还本金的贷款",
          "pf": "teal"
         },
         {
          "pre": "牛顿常数　",
          "s": "只还利息的贷款",
          "pf": "red"
         },
         {
          "s": "每提高一档精度，就要多借一笔新的钱来堵上一笔的窟窿。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU06-loan-analogy.png",
        "maxH": 150,
        "caption": "图 U-6　两笔债的类比。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "这个类比在哪里失效",
        "accent": "red",
        "lines": [
         {
          "s": "贷款有债权人，这里没有；贷款的利息可以被核销，理论里的反项不能。",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 用本文的语言重述这件事",
    "head": "用本文的语言重述这件事",
    "sub": "差别只有一处，而那一处正是本卷的全部赌注",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "可重正化的情形",
        "accent": "teal",
        "lines": [
         "β 函数在某个能标处穿过零点，递推在那里停住。",
         {
          "s": "系统落进不动点。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU07-where-to-stop.png",
        "maxH": 150,
        "caption": "图 U-7　有没有地方停。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "而在引力里",
        "accent": "red",
        "lines": [
         {
          "s": "β 函数的符号是「错」的：G 的有效值随能标上升而增大，递推没有地方停。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "两个情形里的解都只有一族——它们在一阶这件事上是一样的。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 可检验后果与本章的边界",
    "head": "这个猜测的可检验后果，与本章的边界",
    "sub": "两条后果里，第一条可以被追下去",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两个后果",
        "accent": "blue",
        "lines": [
         "一、人为加上一个记忆项，应该能出现一个新的不动点。",
         {
          "s": "二、它只应出现在系数超过阈值的地方。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "本章的边界",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "「引力缺一个记忆项」是一个类比性的说法。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "本院只给出了形状上的对应，没有严格推导。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第四章 · 四条路线，一个形状",
    "head": "第四章 · 四条路线，一个形状",
    "sub": "一条改对象，一条改几何，一条改收敛性的判断，一条改底层的离散性",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条路线各自改了什么",
        "accent": "blue",
        "lines": [
         {
          "pre": "弦论　",
          "s": "把无穷多的项一次装进去",
          "pf": "blue"
         },
         {
          "pre": "圈量子引力　",
          "s": "把几何换成算符",
          "pf": "teal"
         },
         {
          "pre": "渐近安全　",
          "s": "承认发散，但主张它被吸收",
          "pf": "gold"
         },
         {
          "pre": "因果三角剖分　",
          "s": "让连续从离散里长出来",
          "pf": "purple"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU08-four-routes.png",
        "maxH": 165,
        "caption": "图 U-8　四条路线，一个形状。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "4.7 本院的判断",
        "accent": "orange",
        "lines": [
         {
          "s": "本院是先把四条路线读了一遍，然后发现它们可以用同一套语言来描述。这是回溯。",
          "sz": 12.5
         },
         {
          "s": "四条路线里没有一条在讨论递推的阶。",
          "w": 700,
          "f": "red",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "20-vol2a"
 },
 {
  "pages": [
   {
    "title": "第五章 · 记忆项假说",
    "head": "第五章 · 本文的主张：补上那一项",
    "sub": "请读者注意它是一个猜测，不是一个定理",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "主张（记忆项假说）",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "引力的重正化群递推之所以没有可用的不动点，是因为该递推是一阶的。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "如果把它升为二阶——让它同时依赖当前能标与前一个能标——那么它会获得第二族解，而引力所需的那个不动点，可能出现在第二族解里。",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "最后一行的「可能」，是这一章里最重要的一个字。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 四个词需要单独交代",
    "head": "5.1 四个词需要单独交代",
    "sub": "否则它会被读成一句空话",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本院在这里的意思",
        "accent": "blue",
        "lines": [
         {
          "pre": "没有可用的不动点　",
          "s": "它没有地方停",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "升为二阶　",
          "s": "规则同时看当前能标与前一个",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "第二族解　",
          "s": "特征方程第二个根对应的那一族",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "可能　",
          "s": "一个尚未计算的希望",
          "pf": "red",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "本院没有主张什么",
        "accent": "muted",
        "lines": [
         "没有说引力「发散到无穷」。",
         "没有给出「前一个能标」如何取值。",
         "没有说那一族解就是引力。",
         {
          "s": "没有做任何数值或解析计算。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 它为什么不是定理",
    "head": "5.2 它为什么不是定理",
    "sub": "能做，不等于该做",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         "要把一条一阶递推升为二阶，需要做的动作其实很小：右边多了一个参数。",
         {
          "s": "在数学上，这个动作是平凡的——你可以对任何递推做这件事。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三问，本院一个都没有回答",
        "accent": "red",
        "lines": [
         {
          "s": "多出来的那一项从哪来、它有没有物理含义、它会不会破坏已知的低能行为。",
          "w": 700,
          "f": "red",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 二阶递推会多出什么",
    "head": "5.3 二阶递推会多出什么",
    "sub": "到此为止，全部是代数",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "升为二阶",
        "accent": "blue",
        "lines": [
         {
          "s": "λ = 0 时退化为一阶。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "它意味着本院并没有丢掉原来的理论，而是把它包含进来了。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "λ ≠ 0 时",
        "accent": "teal",
        "lines": [
         {
          "s": "特征方程是一个二次方程，它有两个根 r₁ 与 r₂。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "一阶理论的特征方程是一次方程，只有一个根。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "物理的部分从下一节开始。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 两个根分别意味着什么",
    "head": "5.4 两个根分别意味着什么",
    "sub": "本院只做一个定性的说明",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一个根",
        "accent": "teal",
        "lines": [
         {
          "s": "r₁ 接近一阶解。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "两个根中必然有一个接近原来那个一阶根。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二个根是新的",
        "accent": "orange",
        "lines": [
         "它的行为取决于 λ 的大小与符号。",
         {
          "s": "这一族解在低能标下被压制。",
          "sz": 13,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 两族解的相对权重",
    "head": "5.5 两族解的相对权重",
    "sub": "两族解不是永远并肩走的",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "关键在于",
        "accent": "blue",
        "lines": [
         {
          "s": "两个幂函数的相对权重随 n 变化。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "A 与 B 由初值决定。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU09-two-families.png",
        "maxH": 150,
        "caption": "图 U-9　两族解的相对权重随 n 变化。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "「几乎」这个偏差，可能正是记忆项在起作用——它在低能标下被压制，在高能标附近才露出来。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "本院必须立刻补一句：这句话本院无法验证。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 跨卷指引：同样的一个「位」",
    "head": "5.6 一处跨卷指引：第一卷那边有一个同样的「位」",
    "sub": "真正的问题不是「λ 等于多少」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一卷那台算式里也有一个位置",
        "accent": "purple",
        "lines": [
         "外源项的位置。",
         {
          "s": "它取零的时候，理论退化回熟悉的样子。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二卷的 λ 就是这样一个位",
        "accent": "teal",
        "lines": [
         {
          "s": "那么真正的问题不是「λ 等于多少」。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "本院没有答案。本院只是把问题写清楚。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 三条推翻条件",
    "head": "5.7 这个主张在什么情况下被推翻",
    "sub": "本院把它们写出来，是为了让读者能反驳本院",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第 1 条（致命的）",
        "badge": {
         "s": "推翻条件",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         {
          "s": "如果引力的紫外行为被证明与「阶」无关。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "怎么检验：读渐近安全的数值结果。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU10-refutation-conditions.png",
        "maxH": 140,
        "caption": "图 U-10　三条推翻条件。"
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第 2 条",
        "badge": {
         "s": "推翻条件",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         {
          "s": "如果记忆项的引入在数学上不可实现。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "怎么检验：直接构造一个候选的二阶方程。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第 3 条（只推翻一条旁证）",
        "badge": {
         "s": "推翻条件",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "如果三线不交汇的偏差被已知效应完全解释。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 本院对这一章的自评",
    "head": "5.8 本院对这一章的自评：丙级",
    "sub": "三条理由，本院全部写出来",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一",
        "accent": "orange",
        "lines": [
         "从「阶」到「不动点」这一步。",
         {
          "s": "本院没有做任何计算。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "二",
        "accent": "orange",
        "lines": [
         "「记忆项」在量子场论里。",
         {
          "s": "没有明确对应物。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "三",
        "accent": "red",
        "lines": [
         {
          "s": "它与「随便加一项就能得到想要的结果」",
          "sz": 11,
          "f": "navy"
         },
         {
          "s": "很难区分。",
          "sz": 11,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         {
          "s": "它值得被写下来的唯一理由是：它给出了一个可以被检验的方向。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 本章的边界",
    "head": "5.9 本章的边界",
    "sub": "三条必须说清楚的",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一",
        "accent": "blue",
        "lines": [
         "本章没有给出 λ 的来源。",
         {
          "s": "只说它是一个可以取零的系数。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二",
        "accent": "blue",
        "lines": [
         "第二族解承载引力是一个读法。",
         {
          "s": "依据只有一条：第一族解已被三种力占满。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三",
        "accent": "teal",
        "lines": [
         "当 λ = 0 时，本章全部作废。",
         {
          "s": "这不是弱点，是设计。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 差别度是什么物理量",
    "head": "第六章 · 差别度是什么物理量",
    "sub": "这是本章的核心猜测",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "猜测（对应假说）",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "可重正化程度与差别度是同一个量的两种说法。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "这就是台账上的 C28。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU11-difference-budget.png",
        "maxH": 150,
        "caption": "图 U-11　差别的收支。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         {
          "s": "重正化就是「把新的差别吸收进旧的定义里」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 它不等同于熵",
    "head": "6.2 它不等同于熵",
    "sub": "它们的区别在于方向",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "一个具体的例子",
        "accent": "blue",
        "lines": [
         "设一个盒子，里面有 N 个分子。",
         {
          "s": "两个量在同一个过程里：一个单调上升，一个单调下降。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "本院知道这两句话看起来是矛盾的",
        "accent": "teal",
        "lines": [
         {
          "s": "它们不矛盾，因为说的是不同的东西。",
          "w": 700,
          "f": "navy"
         },
         {
          "s": "一个热平衡的气体，熵最大，而差别度是零。",
          "sz": 12.5
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "第一卷真正用到的，是第二个数字。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 三行对应的逐行说明",
    "head": "6.5 三行对应的逐行说明",
    "sub": "三行里没有一行是从计算里出来的",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一行",
        "accent": "teal",
        "lines": [
         "可重正化 ↔ 差别能被吸收。",
         {
          "s": "这一行最容易接受。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二行",
        "accent": "orange",
        "lines": [
         "产生速度超过处理能力。",
         {
          "s": "最没有依据的一行。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三行",
        "accent": "purple",
        "lines": [
         "渐近安全 ↔ 产生与合并达到平衡。",
         {
          "s": "最漂亮，也最危险。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "「速度」在物理里没有对应的量——没有人测量过「引力产生新差别的速度」。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 自评与为什么不删掉它",
    "head": "6.6 本院对这个猜测的自评：丙级",
    "sub": "删掉它，读者就看不到本院在猜什么",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四条理由",
        "accent": "orange",
        "lines": [
         "「可重正化程度」这个词，本院没有给出定义。",
         "三行对应表是翻译出来的，不是从计算里出来的。",
         {
          "s": "这个猜测目前没有任何可检验的后果。",
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "它的左边不可测，右边没有定义。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "为什么本院不删掉它",
        "badge": {
         "s": "台账 C28",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         {
          "s": "它是全台账里唯一一条给不出推翻条件的回溯类主张。",
          "w": 700,
          "f": "red",
          "sz": 13
         },
         {
          "s": "本院把它挂在那里，是因为挂着比藏着诚实。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章边界 + 第七章检验场",
    "head": "6.8 本章的边界，与 7.1 为什么提瓦特是合适的检验场",
    "sub": "一个理论最难的部分，是找到能把它逼到墙角的地方",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "6.8 三条边界",
        "accent": "red",
        "lines": [
         "本章没有测量 D 的方法。",
         "「可重正化程度」是本院自造的词。",
         {
          "s": "三行对应表全部是形状上的对应。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "7.1 三条理由",
        "accent": "teal",
        "lines": [
         {
          "s": "一张只在纸上成立的方程，永远不会疼。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "而物理里的封闭系统，参数从来不是写在外面的。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 三组对应",
    "head": "7.3 「封闭」在物理里对应什么，7.4 三组对应",
    "sub": "等级不是装饰，它决定了读者能不能引用",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三组对应",
        "accent": "blue",
        "lines": [
         {
          "pre": "规格　",
          "s": "紫外截断 Λ　乙级",
          "pf": "teal"
         },
         {
          "pre": "死之诅咒　",
          "s": "反项　丙级",
          "pf": "orange"
         },
         {
          "pre": "天钉　",
          "s": "一次截断的重新设定　丙级",
          "pf": "orange"
         },
         {
          "s": "后面两条只能被理解，不能被检验。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU12-teyvat-correspondence.png",
        "maxH": 150,
        "caption": "图 U-12　三组对应。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "截断破坏了对称性，因此需要反项来修补——而第一卷在回溯一之二里刚刚找到了这样一条材料。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 共同的可检验后果",
    "head": "7.5 这两条线索有一条共同的可检验后果",
    "sub": "如果提瓦特的维护动作确实呈现约 73 年的间隔",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         "如果这个对应是对的，那么提瓦特那些维护动作就应该显示出某种周期性。",
         {
          "s": "如果维护动作确实呈现约 73 年的间隔，那么这一节的对应就多了一分支持。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "7.6 三条边界",
        "accent": "red",
        "lines": [
         "本章的对应全部是形状上的。",
         {
          "s": "「提瓦特适合当检验场」本身是一个主张。",
          "sz": 12.5
         },
         {
          "s": "本章提出的检验方式，本院自己无法执行。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第八章",
        "accent": "purple",
        "lines": [
         {
          "s": "本章的内容已整体移入第三卷，并在那里大幅扩写为十章。",
          "sz": 13,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第九章 · 反例、边界与待证",
    "head": "第九章 · 反例、边界与待证",
    "sub": "一个值得继续的问题，与一份还不够格的答卷",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三个反例，分量不同",
        "accent": "red",
        "lines": [
         {
          "s": "第一个是致命的——它直接推翻本卷的核心主张。",
          "sz": 12.5,
          "f": "red"
         },
         "第二个只是砍掉一条旁证。",
         {
          "s": "第三个伤的是第四章的归类。",
          "sz": 12.5
         }
        ]
       },
       {
        "k": "card",
        "title": "9.4 本院对本卷的自评",
        "accent": "orange",
        "lines": [
         {
          "s": "一个值得继续的问题，与一份还不够格被称为理论的答卷。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "五条待证里四条可以检验，其中两条是纯计算的。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "本卷的核心主张并不是无法检验的，只是本院没有去算。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "21-vol2b"
 },
 {
  "pages": [
   {
    "title": "第三卷 · 接缝：两份材料互相解释",
    "head": "第三卷 · 接缝：两份材料互相解释",
    "sub": "合订本新增的部分",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本卷要回答的",
        "accent": "teal",
        "lines": [
         {
          "s": "两个理论各自能为对方的困难提供一个说法。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "这种关系比「包含」弱，比「类比」强，本院称之为「互相解释」。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三道防线",
        "accent": "red",
        "lines": [
         "互相解释不是互相证明。",
         "它可能只是同一套隐喻的两次使用。",
         {
          "s": "物理那部分比第一卷更弱。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "一份共同的可检验后果",
        "accent": "gold",
        "lines": [
         {
          "s": "如果维护动作确实呈现约 73 年的间隔，这条对应就多一分支持。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 本卷要处理的关系",
    "head": "第一章 · 先把「互相解释」定准",
    "sub": "把四种关系逐一划清界限",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院在这一章要做三件事",
        "accent": "blue",
        "lines": [
         "把「包含」「等价」「互相解释」「类比」四种关系逐一划清界限。",
         "给出一张四种关系的强弱对照表。",
         {
          "s": "给出三条判据，并拿这两份材料去过一遍。",
          "w": 700,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "互相解释不构成任何一方为真的证据。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 四种关系：四条义务清单",
    "head": "1.2 四种关系：四条不同的义务清单",
    "sub": "它们要求的翻译强度不同，能否被推翻也不同",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "包含",
        "accent": "blue",
        "lines": [
         "子理论的每条陈述可译为母理论的真陈述。",
         {
          "s": "翻译必须，构成证据，能被推翻。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "等价",
        "accent": "teal",
        "lines": [
         "双向可译，且保真值。",
         {
          "s": "翻译必须且可逆。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "互相解释",
        "badge": {
         "s": "本卷主张",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         "各能说中对方一处具体困难。",
         {
          "s": "不必须翻译，不构成证据。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "类比",
        "accent": "orange",
        "lines": [
         "只是形状相似。",
         {
          "s": "几乎不能被推翻。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 四种关系的强弱对照表",
    "head": "1.3 四种关系的强弱对照表",
    "sub": "最后两列是本卷的全部要害",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "是否构成证据",
        "accent": "red",
        "lines": [
         {
          "pre": "包含　",
          "s": "是",
          "pf": "teal"
         },
         {
          "pre": "等价　",
          "s": "是",
          "pf": "teal"
         },
         {
          "pre": "互相解释　",
          "s": "否",
          "pf": "red",
          "w": 700
         },
         {
          "pre": "类比　",
          "s": "否",
          "pf": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "能否被推翻",
        "accent": "blue",
        "lines": [
         {
          "pre": "包含　",
          "s": "能——找出一条译不过去的陈述",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "等价　",
          "s": "能——找到一边推得出、另一边推不出的后果",
          "pf": "blue",
          "sz": 13
         },
         {
          "pre": "互相解释　",
          "s": "能——若那处困难其实不存在",
          "pf": "gold",
          "sz": 13
         },
         {
          "pre": "类比　",
          "s": "几乎不能",
          "pf": "red",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "本院在第一页就承认，本卷主张的这种关系不构成证据。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 与「包含」的界限",
    "head": "1.4 与「包含」的界限",
    "sub": "三条",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一条",
        "accent": "red",
        "lines": [
         "状态量对不上。",
         {
          "s": "一个是状态量，一个是参数。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二条",
        "accent": "red",
        "lines": [
         "方向可能是反的。",
         {
          "s": "没有把两者接起来的桥。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三条",
        "accent": "orange",
        "lines": [
         {
          "s": "这两份材料目前推不翻。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "等价要求双向可译且保真值——本院给不出这一步。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 判据三条与过一遍",
    "head": "1.7 判据三条，与 1.8 拿它们过一遍",
    "sub": "第三条最要紧，也最难满足",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "判据一 双向",
        "badge": {
         "s": "过",
         "c": "teal"
        },
        "accent": "teal",
        "lines": [
         {
          "s": "两份材料都能说中对方一处困难。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "判据二 具体",
        "badge": {
         "s": "成色不均",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         {
          "s": "有些地方只是同一套隐喻的两次使用。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "判据三 可失败",
        "badge": {
         "s": "勉强过",
         "c": "orange"
        },
        "accent": "orange",
        "lines": [
         {
          "s": "而且只在一个点上过。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "一条说不出「什么情况下会错」的主张，与一条正确的主张，在读者眼里长得一模一样。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 本章的判断与等级",
    "head": "1.9 本章的判断与等级",
    "sub": "三条",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "判断一",
        "accent": "gold",
        "lines": [
         "两份材料的关系是「互相解释」。",
         {
          "s": "不是「包含」，也不是「等价」。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断二",
        "accent": "orange",
        "lines": [
         "眼下只在一个点上可以被检验。",
         {
          "s": "其余部分仍是类比。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断三",
        "accent": "red",
        "lines": [
         {
          "s": "互相解释不构成任何一方为真的证据。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第一章 · 边界与两种误读",
    "head": "1.10 边界与两种误读",
    "sub": "一份想找台阶的材料，不会在第八节写「它们其实还是类比」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "误读一",
        "accent": "red",
        "lines": [
         "把「互相解释」读成「互相支持」。",
         {
          "s": "那张表里「是否构成证据」写的是「否」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "误读二",
        "accent": "red",
        "lines": [
         "把「互相解释」读成「本院在给自己找台阶」。",
         {
          "s": "1.8 节把不合格的那几条当场列了出来。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "本章讨论的是两份材料之间的逻辑关系，不是它们各自的证据强度。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 世界式能给物理提供什么",
    "head": "第二章 · 世界式能给物理提供什么",
    "sub": "三样提供物",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一、二阶样机",
        "accent": "blue",
        "lines": [
         "一台已经被算到底的二阶递推机。",
         {
          "s": "意义不在于数字，在于数字的来路。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "二、密合算子",
        "accent": "teal",
        "lines": [
         "一个「差别减少」的具体算子。",
         {
          "s": "第一卷 3.1、3.2、1.6 节。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "三、维护成本",
        "accent": "gold",
        "lines": [
         "封闭要持续付钱的完整推演。",
         {
          "s": "它把那个默认翻出来看了一眼。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "截断改变的是算子形态，不只是算子速度。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 三样提供物的共同形状",
    "head": "2.5 三样提供物的共同形状",
    "sub": "三样都是「取消一个借口」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它提供的其实是什么",
        "accent": "teal",
        "lines": [
         "一、一个存在性证明。",
         "二、一个动作的定义。",
         {
          "s": "三、一次对默认值的检查。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "它不提供什么",
        "accent": "red",
        "lines": [
         "不提供「物理的递推是二阶」。",
         "不提供「物理里有这个动作」。",
         {
          "s": "不提供「物理的截断也要付钱」。",
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "它们能做的只有一件事：把「这条路根本走不通」这句话，改成「这条路还没有人走」。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 世界式提供不了的三样东西",
    "head": "2.6 世界式提供不了的三样东西",
    "sub": "免得这两章看起来像在做宣传",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一个耦合常数的对应物",
        "accent": "red",
        "lines": [
         {
          "s": "本院没有把两者接起来的桥。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "任何一个数",
        "accent": "red",
        "lines": [
         {
          "s": "它们对物理没有约束力。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "一次实验",
        "accent": "red",
        "lines": [
         {
          "s": "提瓦特没有可控实验。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "第三行反过来解释了为什么本章的标题是「能给物理提供什么」，而不是「能与物理互证」。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第二章 · 判断与边界",
    "head": "2.7 本章的判断，与 2.8 边界",
    "sub": "扣上的方式都是「取消借口」",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判断一",
        "accent": "gold",
        "lines": [
         {
          "s": "扣上的方式都是「取消借口」，不是「提供理由」。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断二",
        "accent": "teal",
        "lines": [
         {
          "s": "截断改变的是算子形态，不只是算子速度。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三条边界",
        "accent": "red",
        "lines": [
         "本章没有做任何物理计算。",
         "本章的跨卷出处全部指向第一卷。",
         {
          "s": "本院反复遇到一个诱惑：把「扣得上」写成「对得上」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 物理能给世界式提供什么",
    "head": "第三章 · 物理能给世界式提供什么",
    "sub": "反向的账要单独记",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一、上限的框架",
        "accent": "blue",
        "lines": [
         "一个「为什么会有上限」的框架。",
         {
          "s": "把「刻在万物之中」读成「不可绕过」。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "二、不动点的语言",
        "accent": "teal",
        "lines": [
         "「不动点」这门语言。",
         {
          "s": "把「唯一结果」读成「一种情形」。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "三、可说不的场所",
        "accent": "gold",
        "lines": [
         "一个可以说「不」的场所。",
         {
          "s": "把「等材料」变成「可以动手」。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "两份材料互相提供的东西全部是看法，两份材料各自缺的东西全部是做法。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 都是语言，不是证据",
    "head": "3.5 三样提供物的共同点：都是语言，不是证据",
    "sub": "与第二章 2.5 节是对称的",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "它是哪种东西",
        "accent": "teal",
        "lines": [
         "一、一种读法。",
         "二、一门分类。",
         {
          "s": "三、一个场所。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "它不能改变什么",
        "accent": "red",
        "lines": [
         "不能证明规格存在。",
         "不能证明提瓦特的不动点是零。",
         {
          "s": "不能替本院动手。",
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "这不是两个理论的互相支撑，而是两份卡在不同位置的材料，各自能看懂对方的难处。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 物理不能给世界式提供的三样东西",
    "head": "3.6 物理不能给世界式提供的三样东西",
    "sub": "一个连代理指标都提不出的量，比一个量不出来的量更麻烦",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一个 D 的测量方法",
        "accent": "red",
        "lines": [
         {
          "s": "它连一个可测量代理指标都提不出来。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "一条新的原文",
        "accent": "red",
        "lines": [
         {
          "s": "物理这一侧没有这类东西。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "对「73 年」的裁决",
        "accent": "red",
        "lines": [
         {
          "s": "物理这一侧没有对应的日历。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "第一卷 8.5 节建议二至少给出了代理指标的做法；而第二卷承认「可重正化程度」这个词在物理里根本不存在。",
          "w": 700,
          "f": "navy",
          "sz": 12
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第三章 · 判断与边界",
    "head": "3.7 本章的判断，与 3.8 边界",
    "sub": "本章借来的语言，本身就是弱材料",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "判断一",
        "accent": "gold",
        "lines": [
         "三样提供物都能扣上第一卷的缺口。",
         {
          "s": "其中最有分量的是第一样。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断二",
        "accent": "teal",
        "lines": [
         {
          "s": "互相提供的是看法，各自缺的是做法。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "三条边界",
        "accent": "red",
        "lines": [
         "第二、三章合起来构成本卷最长的一段，两张表是对称的。",
         {
          "s": "本章所有的跨卷出处全部标着丙级或乙级。",
          "sz": 12.5
         },
         {
          "s": "本院最容易犯的错，是把「提供了语言」写成「提供了答案」。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第四章 · 一个世界式自己问不出来的问题",
    "head": "第四章 · 一个世界式自己问不出来的问题",
    "sub": "提瓦特的不动点为什么是零",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "两种零",
        "accent": "blue",
        "lines": [
         {
          "pre": "参数的零　",
          "s": "被设计成零",
          "pf": "purple"
         },
         {
          "pre": "状态的零　",
          "s": "本来就是零",
          "pf": "teal"
         },
         {
          "s": "第二卷把两种不动点写在同一节里，但没有把它们分开。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU13-zero-vs-nonzero.png",
        "maxH": 150,
        "caption": "图 U-13　零不动点与非零不动点。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "「终末是零」在物理的语言里是特殊情形，而不是通例。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第四章 · 把什么分开了",
    "head": "4.5 这个问题把什么分开了，4.6 能不能被检验",
    "sub": "它把设定与结果分开了",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "若答案偏向「被设计成零」",
        "accent": "purple",
        "lines": [
         {
          "s": "零是一个选择，选择意味着可以不被选。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "终末是可改的，但改它的人在设定层，不在动力层。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "若答案偏向「本来就是零」",
        "accent": "teal",
        "lines": [
         {
          "s": "零是一个边界条件的必然后果。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "第一卷 3.3 节的论证就是完整的；「设计者」这个位置是多余的。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "4.6 本院必须说一句实话",
        "accent": "red",
        "lines": [
         {
          "s": "这两种答案，本院目前一种也检验不了。两头都没有材料。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第四章 · 缺口与盲点是两回事",
    "head": "4.7 缺口与盲点是两回事，4.9 边界",
    "sub": "盲点不是错误",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "缺口",
        "accent": "blue",
        "lines": [
         "第一卷 8.4 节列过五条尚未解决的问题。",
         {
          "s": "这五条全部是「缺口」：本院知道自己还没算出来。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "盲点",
        "accent": "orange",
        "lines": [
         {
          "s": "一份材料看不见某一格，与它看错了某一格，是两回事。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "第一卷在自己那一格里做得相当干净。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第五章 · 共同的可检验后果",
    "head": "第五章 · 两份材料共同的可检验后果",
    "sub": "维护动作不是一次性事件，而应当是一串事件",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "后果甲",
        "accent": "blue",
        "lines": [
         "维护动作是一串事件。",
         {
          "s": "不是一次性事件。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "后果乙",
        "accent": "gold",
        "lines": [
         "间隔应当收缩。",
         {
          "s": "比值接近 0.382。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "后果丙",
        "accent": "teal",
        "lines": [
         "死之诅咒应当有一个开始时刻。",
         {
          "s": "而不是一直存在。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "5.10 边界",
        "accent": "red",
        "lines": [
         {
          "s": "本章没有新增任何数字；它是共同后果，不是共同证据。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "30-vol3a"
 },
 {
  "pages": [
   {
    "title": "第六章 · 两张账并排：全部三十条",
    "head": "第六章 · 两张账并排：全部主张的等级与方向",
    "sub": "这一章不做判断，只做清点",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "badge": {
         "s": "30 条",
         "c": "blue"
        },
        "accent": "blue",
        "lines": [
         {
          "s": "附录 F 的主张台账把第一卷与第二卷的主张一并入账，共 30 条。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "第一卷 25 条，第二卷 5 条。本章的分组统计只用了台账的两个字段（方向、等级）与一个是否存在（推翻条件）。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本章不做的事",
        "accent": "orange",
        "lines": [
         "它没有评估主张的内容重要性。",
         {
          "s": "一张 30 行的表会把重要性抹平。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "台账登记的是主张，不是论证",
        "accent": "red",
        "lines": [
         {
          "s": "甲级说的是原文来源硬，不是推出过程对。",
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 按方向分组",
    "head": "6.3 按方向分组",
    "sub": "两条预测是同一个公式的连续两次输出",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "分布",
        "accent": "blue",
        "lines": [
         {
          "pre": "预测　",
          "s": "2 条　7%",
          "pf": "red",
          "w": 700
         },
         {
          "pre": "回溯　",
          "s": "28 条　93%",
          "pf": "blue",
          "w": 700
         },
         {
          "s": "两条预测全部在第一卷补论四（C03、C04）。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "C03 与 C04",
        "accent": "gold",
        "lines": [
         "C03 是那个比值（0.382）。",
         {
          "s": "C04 是把它代入之后得到的年份。",
          "f": "navy"
         },
         {
          "s": "73 年之后是 292 年——这两个数字是同一个公式的连续两次输出。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "整套材料的可检验性，目前全部压在补论四这一个点上。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 按等级分组",
    "head": "6.4 按等级分组",
    "sub": "甲级不等于强",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "甲级 11 条",
        "accent": "gold",
        "lines": [
         "原文直证。",
         {
          "s": "37%。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "乙级 10 条",
        "accent": "teal",
        "lines": [
         "需要一步翻译。",
         {
          "s": "33%。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "丙级 9 条",
        "accent": "orange",
        "lines": [
         "形状对应。",
         {
          "s": "30%。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "甲级的意思是「原文直说」，不是「世界式推出了」。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "11 条甲级里，10 条是关于提瓦特侧的材料记录；只有 C30 是关于物理的。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 交叉表",
    "head": "6.5 交叉表",
    "sub": "左上那一格是空的",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "交叉表",
        "accent": "blue",
        "lines": [
         {
          "s": "预测 × 甲级 = 0　预测 × 乙级 = 0　预测 × 丙级 = 2",
          "mono": true,
          "sz": 12,
          "f": "gold"
         },
         {
          "s": "回溯 × 甲级 = 11　回溯 × 乙级 = 10　回溯 × 丙级 = 7",
          "mono": true,
          "sz": 12,
          "f": "gold"
         },
         {
          "s": "合计：甲 11、乙 10、丙 9，共 30。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "那一格空着是结构性的",
        "accent": "teal",
        "lines": [
         {
          "s": "一条「原文直证」的主张，不可能同时是「框架提前推出的」。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "如果原文说了，它就不算提前。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "预测能力与原文硬度这两条轴，从来没有同时高过。两条预测都是丙级——这是全部问题的形状。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 那张不好看的成绩单",
    "head": "6.6 那张不好看的成绩单",
    "sub": "本院不打算把它藏起来",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "几项指标",
        "accent": "red",
        "lines": [
         {
          "pre": "主张总数　",
          "s": "30",
          "pf": "blue"
         },
         {
          "pre": "预测类占比　",
          "s": "7%（2/30）",
          "pf": "red"
         },
         {
          "pre": "写了推翻条件的　",
          "s": "70%（21/30）",
          "pf": "gold"
         },
         {
          "pre": "未写推翻条件的　",
          "s": "9 条（8 条甲级，本不需要）",
          "pf": "muted",
          "sz": 12
         },
         {
          "pre": "回溯类却给不出推翻条件的　",
          "s": "1 条：C28",
          "pf": "red",
          "w": 700,
          "sz": 12
         }
        ]
       },
       {
        "k": "card",
        "title": "C28",
        "badge": {
         "s": "不合格",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         {
          "s": "差别度 D 可能与物理里的「可重正化程度」是同一个量。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "它标着回溯、丙级，而它的推翻条件一栏是空的。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "删掉它，读者就看不到本院在猜什么；把它挂在台账上，比藏着诚实。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 两张账并排",
    "head": "6.7 两张账并排",
    "sub": "本院在写这一卷时最不愿看、但最该看的一张",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一卷",
        "accent": "blue",
        "lines": [
         {
          "pre": "主张总数　",
          "s": "25",
          "pf": "blue"
         },
         {
          "pre": "甲 / 乙 / 丙　",
          "s": "10 / 9 / 6",
          "pf": "blue"
         },
         {
          "pre": "预测　",
          "s": "2",
          "pf": "red"
         },
         {
          "pre": "回溯　",
          "s": "23",
          "pf": "blue"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二卷",
        "accent": "purple",
        "lines": [
         {
          "pre": "主张总数　",
          "s": "5",
          "pf": "purple"
         },
         {
          "pre": "甲 / 乙 / 丙　",
          "s": "1 / 1 / 3",
          "pf": "purple"
         },
         {
          "pre": "预测　",
          "s": "0",
          "pf": "red",
          "w": 700
         },
         {
          "pre": "回溯　",
          "s": "5",
          "pf": "purple"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "第二卷五条主张里，没有一条预测，最高等级只到乙级一条。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "这就是本卷第一章那句话的量化版本：一份材料推得动，一份材料只有看法。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第六章 · 从表里读出的四件事",
    "head": "6.8 从表里能读出的四件事，与 6.9 边界",
    "sub": "四条",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四件事",
        "accent": "gold",
        "lines": [
         "一、整套材料的可检验性压在补论四一个点上。",
         "二、第二卷没有任何预测。",
         {
          "s": "三、甲级不等于强。",
          "f": "navy"
         },
         {
          "s": "四、有一条回溯类至今给不出推翻条件。",
          "f": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "6.9 边界",
        "accent": "red",
        "lines": [
         "台账登记的是主张，不是论证。",
         "台账里的锚点是章节号，不是页码。",
         {
          "s": "本卷没有改动台账的任何一条。",
          "f": "navy"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 为什么要看卡住的地方",
    "head": "第七章 · 两份材料各自「卡住」的位置",
    "sub": "三处卡住，分属三类，不是同一类",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "teal",
        "lines": [
         {
          "s": "两份材料各自「卡住」的位置也是一样的：都有一个东西算不进去。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "而三处卡住都不是「理论错」的证据。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "而三处卡住都是「理论不可用」的证据。",
          "w": 700,
          "f": "red",
          "sz": 14
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 第一卷卡住的两处",
    "head": "7.2、7.3 第一卷卡住的两处",
    "sub": "三处卡住里的前两处",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第一处：D 量不出来",
        "accent": "red",
        "lines": [
         {
          "s": "工具不够。",
          "w": 700,
          "f": "red",
          "sz": 13
         },
         {
          "s": "D 有定义，但没有测量方法。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二处：找不到第三种力",
        "accent": "red",
        "lines": [
         {
          "s": "材料没有。",
          "w": 700,
          "f": "red",
          "sz": 13
         },
         {
          "s": "检验核心论证的唯一直接途径，目前没有材料。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "这一处的形状与上一处不同：上一处是「工具不够」，这一处是「材料没有」。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 三处卡住的对照表",
    "head": "7.4、7.5 第二卷卡在哪，与三处卡住的对照表",
    "sub": "一个数都没算",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "第二卷卡在哪",
        "accent": "purple",
        "lines": [
         {
          "s": "一个数都没算。",
          "w": 700,
          "f": "purple",
          "sz": 13
         },
         {
          "s": "第二卷 9.2 节写：本院是研究者，不是物理学家。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "三处卡住对照表",
        "accent": "blue",
        "lines": [
         {
          "pre": "第一卷　",
          "s": "D 量不出来（工具）",
          "pf": "blue",
          "sz": 12.5
         },
         {
          "pre": "第一卷　",
          "s": "找不到第三种力（材料）",
          "pf": "blue",
          "sz": 12.5
         },
         {
          "pre": "第二卷　",
          "s": "一个数都没算（计算）",
          "pf": "purple",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 两类性质的差别",
    "head": "7.6、7.7 是同一类还是两类，与两类性质的差别",
    "sub": "本院认为这是本卷最该被记住的一段",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "不是同一类",
        "accent": "teal",
        "lines": [
         {
          "s": "三处卡住分属三类：测量、材料、计算。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "把三处并排、并给它们贴上标签，是本卷的整理。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "两句话",
        "accent": "gold",
        "lines": [
         {
          "s": "三处卡住都不是「理论错」的证据。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "而三处卡住都是「理论不可用」的证据。",
          "w": 700,
          "f": "red",
          "sz": 12.5
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第七章 · 判断与边界",
    "head": "7.9 本章的判断，与 7.10 边界",
    "sub": "本章没有解决任何一处卡住",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "判断一",
        "accent": "gold",
        "lines": [
         "卡住的位置是三处，分属三类。",
         {
          "s": "不是同一类。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断二",
        "accent": "orange",
        "lines": [
         "不是「理论错」的证据。",
         {
          "s": "都是「理论不可用」的证据。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "判断三",
        "accent": "teal",
        "lines": [
         "物理侧的待证清单第 3 条若被解决。",
         {
          "s": "可能给 D 提供第一个候选代理指标。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "7.10 边界",
        "accent": "red",
        "lines": [
         {
          "s": "本章没有解决任何一处卡住。它只是把它们排在一张表上，然后给它们分了类。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 三道防线",
    "head": "第八章 · 三道防线",
    "sub": "否则本章会变成一句漂亮话",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "三道防线",
        "accent": "red",
        "lines": [
         "一、互相解释不是互相证明。",
         "二、它可能只是同一套隐喻的两次使用。",
         {
          "s": "三、物理那部分比第一卷更弱。",
          "w": 700,
          "f": "navy"
         }
        ]
       },
       {
        "k": "fig",
        "file": "figU14-mutual-explanation.png",
        "maxH": 150,
        "caption": "图 U-14　互相解释，以及三道防线。"
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院自己想到的第四道",
        "accent": "purple",
        "lines": [
         {
          "s": "这两份材料不是两条独立的证据线。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "一道没有被攻击过的防线，与一句漂亮话的区别，只在于它的措辞更谦虚。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 第一道防线",
    "head": "8.2 第一道防线：互相解释不是互相证明",
    "sub": "一个足够灵活的框架，可以与很多东西「互相解释」",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "两个理论能互相解释，不构成任何一方为真的证据。",
          "w": 700,
          "f": "navy",
          "sz": 14
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "本院能做的唯一一件事",
        "accent": "teal",
        "lines": [
         "是把「互相解释」这个词收紧。",
         {
          "s": "收紧的办法：给出三条判据，并拿两份材料去过一遍。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "本道防线的判断",
        "accent": "gold",
        "lines": [
         {
          "s": "它成立，而且本院反驳不了它。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 第二道防线",
    "head": "8.3 第二道防线：可能是同一套隐喻的两次使用",
    "sub": "本院能反驳它三条，其中两条只算半条",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "反驳一（很弱）",
        "accent": "muted",
        "lines": [
         "时间顺序。",
         {
          "s": "本院先有第一卷的词，再去描述物理。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "反驳二（半条）",
        "accent": "gold",
        "lines": [
         "一个本院没有借的词。",
         {
          "s": "记忆项是本院自己起的名字。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "反驳三（反驳不了）",
        "accent": "red",
        "lines": [
         "换词检验。",
         {
          "s": "换一套词，对应还在不在？",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "orange",
        "lines": [
         {
          "s": "反驳三本院认为它反驳不了，反而支持这道防线。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 第三道防线",
    "head": "8.4 第三道防线：物理那部分更弱",
    "sub": "两道加强证据",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "red",
        "lines": [
         {
          "s": "第一卷有原文支撑，第二卷第五章与第六章没有。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "本院在第一卷里可以标甲级的地方，在第二卷里最多只能标乙级。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "加强证据一",
        "accent": "orange",
        "lines": [
         {
          "s": "第二卷五条主张里，没有一条预测。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       },
       {
        "k": "card",
        "title": "加强证据二",
        "accent": "red",
        "lines": [
         {
          "s": "第三道防线其实有两层，第二层更麻烦。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "一个连代理指标都提不出的量，比一个量不出来的量更麻烦。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第八章 · 四道防线并排与约束",
    "head": "8.5 三道防线并排，8.7 四道防线对本卷其余各章的约束",
    "sub": "四道全部是防御性的",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "8.5 并排",
        "accent": "blue",
        "lines": [
         {
          "pre": "一　",
          "s": "互相解释不是互相证明",
          "pf": "red"
         },
         {
          "pre": "二　",
          "s": "可能是同一套隐喻的两次使用",
          "pf": "orange"
         },
         {
          "pre": "三　",
          "s": "物理那部分更弱",
          "pf": "orange"
         },
         {
          "pre": "四　",
          "s": "不是两条独立的证据线",
          "pf": "purple"
         }
        ]
       },
       {
        "k": "card",
        "title": "8.8 边界",
        "accent": "red",
        "lines": [
         "本章没有提出任何新主张。",
         {
          "s": "四道防线全部是「防御性的」，没有一道是「建设性的」。",
          "sz": 12.5,
          "f": "navy"
         },
         {
          "s": "设防线的行为本身也可能是一种防守姿态。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第九章 · 如果两份材料都是错的",
    "head": "第九章 · 如果两份材料都是错的",
    "sub": "先把「都错」拆成三种",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "甲、各自错在不同地方",
        "accent": "blue",
        "lines": [
         "两处无关。",
         {
          "s": "这种错会各自暴露。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "乙、同错在一个共享前提下",
        "accent": "orange",
        "lines": [
         "暴露时两卷一起倒。",
         {
          "s": "很担心。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "丙、只有这一层错",
        "badge": {
         "s": "最该担心",
         "c": "red"
        },
        "accent": "red",
        "lines": [
         "两份材料各自可能都对。",
         {
          "s": "而它们之间没有关系。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "那两卷都好端端地站着，只有本卷是空的。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第九章 · 四处最脆的地方",
    "head": "9.2 会错在哪：四处最脆的地方",
    "sub": "排在最后那一处牵连最广",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "四处",
        "accent": "red",
        "lines": [
         "第一处：「封闭」这个词。",
         "第二处：「差别度」这个量。",
         "第三处：「D 就是可重正化程度」。",
         {
          "s": "第四处：「维护动作」这个判据。",
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "9.5 判断二",
        "accent": "orange",
        "lines": [
         {
          "s": "排在最后那一处（「维护动作」的判据）是牵连最广的。",
          "w": 700,
          "f": "navy",
          "sz": 12.5
         },
         {
          "s": "错的三条被发现的路里，只有「计算」那一条不依赖运气。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第九章 · 剩下的东西还有没有用",
    "head": "9.4 剩下的东西还有没有用，9.5 判断",
    "sub": "按本院认为的价值从高到低排",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "第一样 问题清单",
        "accent": "gold",
        "lines": [
         {
          "s": "结论会被推翻，问题不会。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "第二样 方法",
        "accent": "teal",
        "lines": [
         "本院认为它比第一样更耐用。",
         {
          "s": "它由两件东西组成。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "第三样 一批反例",
        "accent": "purple",
        "lines": [
         {
          "s": "一批为「后人推翻本院」准备的材料。",
          "sz": 12,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "blue",
        "lines": [
         {
          "s": "错的框架加上诚实的账，比对的框架加上糊涂的账更有用。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "第十章 · 合订本最小的结论",
    "head": "第十章 · 合订本最小的结论",
    "sub": "本院推荐读者记住最后一行",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "一句话",
        "accent": "blue",
        "lines": [
         {
          "s": "互相解释，而不是互相证明。",
          "sz": 12,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "九个字",
        "accent": "teal",
        "lines": [
         {
          "s": "可以说中，不能互相证明。",
          "w": 700,
          "f": "navy",
          "sz": 14
         }
        ]
       },
       {
        "k": "card",
        "title": "六个字",
        "badge": {
         "s": "记住这一行",
         "c": "gold"
        },
        "accent": "gold",
        "lines": [
         {
          "s": "说得中，证不了。",
          "w": 700,
          "f": "navy",
          "sz": 16
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "10.3 本卷没有说的事",
        "accent": "red",
        "lines": [
         "没有说世界式是对的；没有说那个物理猜测是对的。",
         {
          "s": "没有说两份材料互相支持；没有说那条共同后果已经被检验；没有给任何新数字。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "31-vol3b"
 },
 {
  "pages": [
   {
    "title": "附录 F · 台账统计",
    "head": "附录 F · 主张台账全表：统计",
    "sub": "这张表就是那个一眼",
    "rows": [
     {
      "cols": 3,
      "cells": [
       {
        "k": "card",
        "title": "方向",
        "accent": "blue",
        "lines": [
         {
          "pre": "回溯　",
          "s": "28 条　93%",
          "pf": "blue",
          "w": 700
         },
         {
          "pre": "预测　",
          "s": "2 条　7%",
          "pf": "red",
          "w": 700
         },
         {
          "s": "两条预测都是同一处。",
          "sz": 12,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "等级",
        "accent": "gold",
        "lines": [
         {
          "pre": "甲级　",
          "s": "11 条　37%",
          "pf": "gold"
         },
         {
          "pre": "乙级　",
          "s": "10 条　33%",
          "pf": "teal"
         },
         {
          "pre": "丙级　",
          "s": "9 条　30%",
          "pf": "orange"
         }
        ]
       },
       {
        "k": "card",
        "title": "推翻条件",
        "accent": "red",
        "lines": [
         {
          "pre": "有　",
          "s": "21 条　70%",
          "pf": "teal",
          "w": 700
         },
         {
          "pre": "没有　",
          "s": "9 条",
          "pf": "red"
         },
         {
          "s": "其中 8 条是甲级原文直证，按体例本不需要。",
          "sz": 11.5,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "交叉表：左上那一格是空的",
        "accent": "purple",
        "lines": [
         {
          "s": "预测 × 甲级 = 0；预测 × 丙级 = 2。两条预测都是丙级。",
          "sz": 13,
          "f": "navy"
         },
         {
          "s": "预测能力与原文硬度这两条轴，从来没有同时高过。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "附录 F · 三十条按方向与等级",
    "head": "附录 F · 三十条速览",
    "sub": "回＝回溯，预＝预测；甲／乙／丙＝等级",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "回溯 · 甲级 11 条",
        "accent": "gold",
        "lines": [
         {
          "s": "C01 C02 C07 C11 C12 C20 C21 C22 C23 C24 C30",
          "mono": true,
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "回溯 · 乙级 10 条",
        "accent": "teal",
        "lines": [
         {
          "s": "C05 C06 C08 C09 C14 C15 C18 C19 C25 C29",
          "mono": true,
          "sz": 12.5,
          "f": "navy"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "回溯 · 丙级 7 条",
        "accent": "orange",
        "lines": [
         {
          "s": "C10 C13 C16 C17 C26 C27 C28",
          "mono": true,
          "sz": 12.5,
          "f": "navy"
         }
        ]
       },
       {
        "k": "card",
        "title": "预测 · 丙级 2 条",
        "accent": "red",
        "lines": [
         {
          "s": "C03 C04",
          "mono": true,
          "sz": 12.5,
          "f": "red",
          "w": 700
         },
         {
          "s": "同一处、同一个公式的两次输出。",
          "sz": 11.5,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "附录 F · 那一条给不出推翻条件的",
    "head": "附录 F · 本院请读者注意最难看的那一行",
    "sub": "按本院自己的规矩，它是不合格的",
    "rows": [
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "C28",
        "badge": {
         "s": "回溯 · 丙级",
         "c": "orange"
        },
        "accent": "red",
        "lines": [
         {
          "s": "差别度 D 可能与物理里的「可重正化程度」是同一个量。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "它是全台账里唯一一条这样的回溯类主张。",
          "sz": 12,
          "f": "red"
         }
        ]
       },
       {
        "k": "card",
        "title": "两张账的口径不同",
        "accent": "blue",
        "lines": [
         {
          "pre": "正文 8.1　",
          "s": "20 条（甲 10、乙 6、丙 4）",
          "pf": "blue",
          "sz": 12
         },
         {
          "pre": "本台账　",
          "s": "30 条（甲 11、乙 10、丙 9）",
          "pf": "navy",
          "sz": 12
         },
         {
          "s": "两者都对，只是数的不是同一件事。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "gold",
        "lines": [
         {
          "s": "本院请读者注意表里最难看的那一行，而不是最好看的那一行。",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "40-appx"
 },
 {
  "pages": [
   {
    "title": "结尾 · 本院最希望读者问的三个问题",
    "head": "结尾 · 本院最希望读者问的三个问题",
    "sub": "不是本院答得最好的三个，而是最值得被问的三个",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院最希望读者问的三个问题",
        "accent": "red",
        "lines": [
         {
          "s": "「你这条结论，什么情况下会被推翻？」",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "「你这台算式，有没有算错过一次？」",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "「如果 D 等于零，对你来说损失了什么？」",
          "w": 700,
          "f": "navy",
          "sz": 13
         }
        ]
       }
      ]
     },
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "accent": "purple",
        "lines": [
         {
          "s": "本院恳请读者去攻那些地方，而不是去夸那些读起来顺的地方。",
          "w": 700,
          "f": "navy",
          "sz": 13
         },
         {
          "s": "本院最怕的不是被反驳，而是读者读完只记住了一串对应关系。",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   },
   {
    "title": "结尾 · 互相解释的意思",
    "head": "结尾 · 互相解释的意思",
    "sub": "看懂难处不是解决问题。但它比互相点头有用",
    "rows": [
     {
      "cols": 1,
      "cells": [
       {
        "k": "card",
        "title": "本院反复遇到同一个诱惑",
        "accent": "orange",
        "lines": [
         {
          "s": "把「说得中」写成「说得对」。",
          "w": 700,
          "f": "red",
          "sz": 15
         },
         {
          "s": "这两个说法只差一个字，而它们之间隔着一整套东西。",
          "sz": 13,
          "f": "muted"
         }
        ]
       }
      ]
     },
     {
      "cols": 2,
      "cells": [
       {
        "k": "card",
        "title": "这一卷能说的最少的一句话",
        "accent": "gold",
        "lines": [
         {
          "s": "这两份材料互相解释，而不是互相证明。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "只是两份卡在不同位置的材料。",
          "sz": 12.5,
          "f": "muted"
         }
        ]
       },
       {
        "k": "card",
        "title": "合订本的题记",
        "accent": "teal",
        "lines": [
         {
          "s": "两份材料里各缺一个位置，而那两个位置长得一样。",
          "w": 700,
          "f": "navy",
          "sz": 14
         },
         {
          "s": "世界式与大一统 · 内部研究纪要 第 49 号",
          "sz": 12,
          "f": "muted"
         }
        ]
       }
      ]
     }
    ]
   }
  ],
  "id": "90-end"
 }
];

// ============================== 逐页构建 ==============================
const CHAR_LIMIT = 200;
let PN = 0;
for (const pack of PACKS) {
  for (const spec of pack.pages) {
    PN++;
    const pg = buildPage(spec, PN);
    pg.titleText = spec.title || spec.head || "";
    pg.pack = pack.id;
    pages.push(pg);
  }
}

// ============================== 九道检查 ==============================
const SAFE = { left: 6, right: W - 6, top: 2, bottom: H - 2 };
const FOOT_LIMIT = 482;      // 正文内容不得越过这条线（页脚区）
const PAD = 8;               // 卡片内边距
const nospace = (s) => String(s).replace(/[\s\u3000]/g, "");

function runChecks() {
  const errs = [];
  const add = (page, kind, msg) => errs.push({ page, kind, msg });

  for (const p of pages) {
    // ---- 检查 1：文字越界（画布） ----
    for (const e of p.els) {
      if (e.k !== "text") continue;
      const b = textBox(e);
      if (b.left < SAFE.left) add(p.n, "文字越界", "左越界 x=" + b.left.toFixed(1) + " 「" + e.s.slice(0, 24) + "」");
      if (b.right > SAFE.right) add(p.n, "文字越界", "右越界 x=" + b.right.toFixed(1) + " 「" + e.s.slice(0, 24) + "」");
      if (b.top < SAFE.top) add(p.n, "文字越界", "上越界 y=" + b.top.toFixed(1) + " 「" + e.s.slice(0, 24) + "」");
      if (b.bottom > SAFE.bottom) add(p.n, "文字越界", "下越界 y=" + b.bottom.toFixed(1) + " 「" + e.s.slice(0, 24) + "」");
    }

    // ---- 检查 3：卡片重叠（以及卡片压住插图） ----
    const boxes = p.els.filter((e) => (e.k === "rect" && e.box) || e.k === "image");
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 1 && oy > 1) {
          add(p.n, "卡片重叠", (a.file || "卡片") + " 与 " + (b.file || "卡片") +
            " 重叠 " + ox.toFixed(0) + "x" + oy.toFixed(0) + "px");
        }
      }
    }

    // ---- 检查 2：容器高度 / 宽度（文字必须留在自己的卡片里） ----
    for (const g of p.groups) {
      const r = g.rect;
      let last = null;
      for (const t of g.texts) {
        const b = textBox(t);
        if (b.top < r.y + 1) add(p.n, "容器高度", "文字高于卡片顶边：「" + t.s.slice(0, 22) + "」");
        if (b.bottom > r.y + r.h - 2) add(p.n, "容器高度", "文字超出卡片底边 " + (b.bottom - (r.y + r.h)).toFixed(1) + "px：「" + t.s.slice(0, 22) + "」");
        if (b.right > r.x + r.w - PAD) add(p.n, "容器高度", "文字超出卡片右边 " + (b.right - (r.x + r.w - PAD)).toFixed(1) + "px：「" + t.s.slice(0, 22) + "」");
        if (b.left < r.x + PAD - 6) add(p.n, "容器高度", "文字超出卡片左边：「" + t.s.slice(0, 22) + "」");
        if (!last || t.y > last.y) last = t;
      }
      if (g.titleBox && g.bodyFirst) {
        const tb2 = textBox(g.bodyFirst);
        if (tb2.top < g.titleBox.y + 3) {
          add(p.n, "标题压正文", "正文首行探入标题基线区 " + (g.titleBox.y + 3 - tb2.top).toFixed(1) + "px：「" + g.bodyFirst.s.slice(0, 22) + "」");
        }
      }
      if (g.titleBox && g.badge && g.titleBox.right + 10 > g.badge.left) {
        add(p.n, "标题压徽标", "标题与徽标相撞：" + g.titleBox.right.toFixed(0) + " > " + g.badge.left.toFixed(0));
      }
      g.lastText = last;
    }

    // ---- 检查 4：卡片最后一行文字，不得落进同页任何其它色块/插图的范围内 ----
    for (const g of p.groups) {
      if (!g.lastText) continue;
      const r = g.rect;
      const t = g.lastText;
      const tb = textBox(t);
      for (const b of boxes) {
        if (b === r) continue;
        const ox = Math.min(r.x + r.w, b.x + b.w) - Math.max(r.x, b.x);
        if (ox <= 2) continue;
        const oy = Math.min(tb.bottom, b.y + b.h) - Math.max(tb.top, b.y);
        if (oy > 1) {
          add(p.n, "文字被盖", "「" + t.s.slice(0, 22) + "」y=" + t.y.toFixed(1) +
            " 落进下方" + (b.file ? "插图" : "色块") + "[" + b.y.toFixed(0) + "-" + (b.y + b.h).toFixed(0) +
            "]，纵向重叠 " + oy.toFixed(1) + "px（x 重叠 " + ox.toFixed(0) + "px）");
        }
      }
    }

    // ---- 检查 5：页脚安全区 ----
    for (const e of boxes) {
      if (e.y + e.h > FOOT_LIMIT + 0.5) add(p.n, "页脚安全区", (e.file || "色块") + " 底边 " + (e.y + e.h).toFixed(0) + " 越过 " + FOOT_LIMIT);
    }
    for (const g of p.groups) {
      for (const t of g.texts) {
        const b = textBox(t);
        if (b.bottom > FOOT_LIMIT) add(p.n, "页脚安全区", "文字底边 " + b.bottom.toFixed(1) + " 越过 " + FOOT_LIMIT + "：「" + t.s.slice(0, 22) + "」");
      }
    }
    for (const e of p.els) {
      if (e.k !== "text") continue;
      const b = textBox(e);
      if (b.bottom > FOOT_LIMIT && e.gid !== "head") add(p.n, "页脚安全区", "自由文字底边 " + b.bottom.toFixed(1) + " 越过 " + FOOT_LIMIT + "：「" + e.s.slice(0, 22) + "」");
    }

    // ---- 检查 6：插图比例（不得拉伸） ----
    for (const e of p.els) {
      if (e.k !== "image") continue;
      const want = FIGS[e.file].ar, got = e.w / e.h;
      if (Math.abs(want - got) > 0.01) add(p.n, "图片变形", e.file + " 比例 " + got.toFixed(3) + " ≠ " + want.toFixed(3));
    }

    // ---- 检查 9：每页文字总量 ----
    const chars = p.els.filter((e) => e.k === "text").reduce((a, e) => a + nospace(e.s).length, 0);
    p.chars = chars;
    if (chars > CHAR_LIMIT) add(p.n, "字数超限", "本页 " + chars + " 字 > " + CHAR_LIMIT + "（超出 " + (chars - CHAR_LIMIT) + "）");
  }
  return errs;
}

// ============================== 输出 ==============================
function n2(v) { return Math.round(v * 100) / 100; }

function elToSvg(e) {
  if (e.k === "rect") {
    return '<rect x="' + n2(e.x) + '" y="' + n2(e.y) + '" width="' + n2(e.w) + '" height="' + n2(e.h) +
      '" rx="' + n2(e.rx) + '" fill="' + e.f + '"' +
      (e.ec ? ' stroke="' + e.ec + '" stroke-width="' + e.sw + '"' : "") +
      (e.op !== 1 ? ' opacity="' + e.op + '"' : "") + '/>';
  }
  if (e.k === "circle") {
    return '<circle cx="' + n2(e.cx) + '" cy="' + n2(e.cy) + '" r="' + n2(e.r) + '" fill="' + e.f + '"' +
      (e.op !== 1 ? ' opacity="' + e.op + '"' : "") + '/>';
  }
  if (e.k === "image") {
    return '<image x="' + n2(e.x) + '" y="' + n2(e.y) + '" width="' + n2(e.w) + '" height="' + n2(e.h) +
      '" preserveAspectRatio="none" href="data:image/png;base64,' + e.b64 + '"/>';
  }
  return '<text x="' + n2(e.x) + '" y="' + n2(e.y) + '" fill="' + e.f + '" font-size="' + e.sz +
    '" font-weight="' + e.w + '" text-anchor="' + e.a + '" opacity="' + e.op + '"' +
    (e.mono ? ' font-family="Consolas, Microsoft YaHei, monospace"' : "") + '>' + esc(e.s) + '</text>';
}

function svgFor(p) {
  const bg = p.dark
    ? '<defs><linearGradient id="bg' + p.n + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.deep + '"/><stop offset="1" stop-color="' + C.navy + '"/></linearGradient></defs><rect width="' + W + '" height="' + H + '" fill="url(#bg' + p.n + ')"/>'
    : '<rect width="' + W + '" height="' + H + '" fill="' + C.light + '"/>';
  const deco = p.dark
    ? ""
    : '<circle cx="940" cy="20" r="150" fill="' + C.blue + '" opacity="0.05"/><circle cx="20" cy="530" r="120" fill="' + C.teal + '" opacity="0.05"/>';
  const body = p.els.map(elToSvg).join("");
  const num = p.noNum ? "" : '<text x="910" y="508" fill="' + C.muted + '" font-size="12" font-weight="400" text-anchor="end" opacity="0.85">' + String(p.n).padStart(2, "0") + '</text>';
  const foot = p.noNum ? "" : '<text x="72" y="508" fill="' + C.muted + '" font-size="12" font-weight="400" text-anchor="start" opacity="0.7">世界式与大一统 · 内部研究纪要 第 49 号</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + ' ' + H + '" font-family="Microsoft YaHei, Segoe UI, PingFang SC, sans-serif">\n' +
    bg + deco + body + foot + num + '\n</svg>\n';
}

for (const p of pages) {
  await fsp.writeFile(join(HERE, "page-" + String(p.n).padStart(2, "0") + ".svg"), svgFor(p), "utf8");
}

const notes = pages.map((p) => ({
  n: p.n,
  title: p.titleText,
  lines: p.els.filter((e) => e.k === "text").map((e) => e.s),
}));
await fsp.writeFile(join(HERE, "notes.json"), JSON.stringify(notes, null, 1), "utf8");

const outline = pages.map((p) => "| " + String(p.n).padStart(2, "0") + " | " + p.titleText + " |").join("\n");
await fsp.writeFile(join(HERE, "outline.md"),
  "# 合订本课件页目（共 " + pages.length + " 页）\n\n| 页 | 标题 |\n|---|---|\n" + outline + "\n", "utf8");

// ============================== 报告 ==============================
const errs = runChecks();
console.log("生成 " + pages.length + " 页 SVG（960x540），插图 " + FIGUSED.size + "/" + FIGFILES.length + " 张");
const unused = FIGFILES.filter((f) => !FIGUSED.has(f));
if (unused.length) console.log("未使用插图：" + unused.join(", "));
const maxChars = pages.reduce((a, p) => Math.max(a, p.chars), 0);
const over = pages.filter((p) => p.chars > CHAR_LIMIT).length;
console.log("每页文字量：最大 " + maxChars + " 字；超过 " + CHAR_LIMIT + " 字的页 " + over + " 页");
console.log("");
const byKind = {};
for (const e of errs) byKind[e.kind] = (byKind[e.kind] || 0) + 1;
console.log("自检结果：" + (errs.length ? "发现 " + errs.length + " 处问题" : "全部通过（9 项）"));
for (const k of Object.keys(byKind)) console.log("  " + k + "：" + byKind[k] + " 处");
for (const e of errs.slice(0, 80)) console.log("  [第 " + String(e.page).padStart(3, "0") + " 页][" + e.kind + "] " + e.msg);
process.exitCode = errs.length ? 1 : 0;
