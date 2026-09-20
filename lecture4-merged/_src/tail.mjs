
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
