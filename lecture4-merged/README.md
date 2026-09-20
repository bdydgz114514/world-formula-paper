# 《世界式与大一统》合订本课件（lecture4-merged）

**成品**：`世界式-大一统-合订本课件.pptx`（16:9，1920×1080/页，**164 页**，含 PPTX 备注页）
**内容唯一来源**：`../世界式与大一统-合订本.md`（内部研究纪要 第 49 号，三卷 + 合并附录 A~F）
**做法**：照抄 `../lecture3-unified/` 的流水线（数据驱动生成器 + 自检 + Edge 无头渲染 + pptxgenjs）。
`lecture3-unified/` 里的任何文件都没有被修改。

---

## 一、流水线（四步）

| 步骤 | 命令 | 产出 |
|---|---|---|
| 1. 拼装 | `node make-build.mjs` | 由 `_src/head.mjs` + `_packs/*.json` + `_src/tail.mjs` 拼出单文件 `build-slides.mjs` |
| 2. 生成 | `node build-slides.mjs` | `page-01.svg … page-164.svg`、`notes.json`、`outline.md`；**9 项自检，任一不过 exit 1** |
| 3. 包装 + 渲染 | `node build-html-wrap.mjs` 然后 `powershell -ExecutionPolicy Bypass -File .\render-png.ps1` | `_render/page-NN.html` → `png/page-NN.png`（1920×1080） |
| 4. 打包 | `node build-pptx.mjs` | `世界式-大一统-合订本课件.pptx`（每页一张整页图 + 该页文字作备注） |

辅助：

- `node audit-content.mjs` —— 内容溯源自检 + 禁用词检查（游戏内／玩家／官方／策划／实装）。
- `node _figmap.mjs` —— 输出「插图 → 页码」对照表。

`node_modules/` 是从 `../lecture3-unified/node_modules` 复制过来的 pptxgenjs，**没有联网下载**。

---

## 二、9 项自检（`build-slides.mjs` 内置）

1. **文字越界**（画布安全区）
2. **容器高度**（文字必须留在自己的卡片里）
3. **卡片重叠**（含卡片压插图）
4. **文字被盖**（卡片最后一行不得落进同页其它色块/插图的纵向区间）
5. **页脚安全区**（正文底边不得越过 y=482）
6. **图片比例**（插图不得拉伸）
7. **标题压正文**
8. **标题压徽标**
9. **每页文字总量 ≤ 200 字**（本课件追加的一条硬指标）

## 三、版面

- 960×540 SVG，字体 Microsoft YaHei，配色沿用 lecture3（navy/teal/gold/red/blue/purple/orange）。
- 页面是**数据驱动**的：每个 pack 只写「标题 + 若干行 + 单元」，行高、卡片高度、插图高度由渲染器按 356px 纵向预算自动排布。
- 插图一律按原图宽高比换算，竖长图用 `maxH` 限高，**不写死宽高**。

## 四、页面构成（164 页）

| 部分 | 页 | 页数 |
|---|---|---|
| 封面 / 目录 / 合订说明 / 体例两条轴 / 怎么读等级 / 两份原件性质不同 | 01–06 | 6 |
| **第一卷 世界式：一个封闭系统的算术** | 07–74 | 68 |
| **第二卷 大一统：一个缺失的项** | 75–118 | 44 |
| **第三卷 接缝：两份材料互相解释** | 119–159 | 41 |
| **附录 F 主张台账统计** | 160–162 | 3 |
| 结尾 | 163–164 | 2 |

逐页标题见 [`outline.md`](outline.md)。

## 五、插图（44 张，全部用上）

第一卷 30 张、第二卷 12 张（figU01–figU12）、第三卷 2 张（figU13、figU14）。
**说明**：`figU13-zero-vs-nonzero.png` 与 `figU14-mutual-explanation.png` 在合订本原文里位于**第三卷**第四章与第八章，
因此按原文位置放在第三卷的页面上（图张数合计仍是 44）。逐图页码见 `_packs/_figmap.json`。

## 六、与 lecture3-unified 的差异（只有两处）

1. `render-png.ps1` 第 3 行 `$ErrorActionPreference = "Stop"` 改为 `"Continue"`。
   Edge 会把 `QQBrowser user data path not found` 这类无害警告写到 stderr，而在 Windows PowerShell 5.1 下
   「原生命令写 stderr + ErrorActionPreference=Stop」会抛 NativeCommandError，脚本会在第一页就中断、一张图都出不来。
2. `build-slides.mjs` 是新的（内容是合订本三卷的 164 页），自检从 8 项增加到 9 项（多了「每页文字总量 ≤ 200 字」）。

## 七、内容纪律

- 页面上的每一句都来自合订本；引号 `「」` 内的文字逐字照抄（可截断，不改字）。
- 等级与方向按要求留在页面上：甲／乙／丙级、回溯／预测，凡讲判断句的卡片都挂 `badge`。
- **禁止出戏词**：`audit-content.mjs` 对「游戏内／玩家／官方／策划／实装」零容忍，实测命中 0 处。
