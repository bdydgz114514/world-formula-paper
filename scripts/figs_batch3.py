# -*- coding: utf-8 -*-
"""第3批：雷内复盘 / 使用教程流程 / 判别树 / 案例时间线 / 概念关系图  同时修 fig07 缺字形"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Polygon
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE, ORANGE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE", "#E76F51"
def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white"); plt.close(fig); print("wrote", n)

# ---- 修 fig07：把缺字形的 ⇒ 换成 → ----
fig, ax = plt.subplots(figsize=(12, 7.2)); ax.set_xlim(0, 12); ax.set_ylim(0, 7.6); ax.axis("off")
layers = [
    (5.55, 2.30, "元层｜降临者层", PURPLE, "唯一能改写不动点的操作：从系统外注入差别（改的是初始项，不是算子）"),
    (3.00, 2.30, "逻辑层｜哥德尔层", BLUE, "系统封闭 + 自指 → 必存在系统内不可判定命题 → 内部可「卡 bug」，但改不了不动点"),
    (0.45, 2.30, "动力层｜雷内算的那层", TEAL, "差别度 D 在封闭系统中单调衰减，唯一吸引子 D* = 0，可一路推演到终末"),
]
for y, h, title, col, desc in layers:
    ax.add_patch(FancyBboxPatch((0.7, y), 10.6, h, boxstyle="round,pad=0.10,rounding_size=0.22", fc=col, ec="none", alpha=0.13))
    ax.add_patch(FancyBboxPatch((0.7, y+h-0.78), 10.6, 0.78, boxstyle="round,pad=0.06,rounding_size=0.18", fc=col, ec="none"))
    ax.text(0.98, y+h-0.39, title, ha="left", va="center", color="white", fontsize=12.5, fontweight="bold")
    ax.text(1.0, y+0.72, desc, ha="left", va="center", fontsize=10.2, color=NAVY)
ax.add_patch(FancyArrowPatch((11.05, 1.4), (11.05, 7.2), arrowstyle="-|>", lw=2.0, color=GREY, mutation_scale=16))
ax.text(11.38, 4.3, "抽象层级升高", rotation=90, va="center", ha="center", fontsize=9.5, color=GREY)
ax.text(6.0, 0.05, "图 8　同一个方程在三个抽象层级上的投影", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig08-threelayers.png")

# ---------- 图 30 雷内方案复盘 ----------
fig, ax = plt.subplots(figsize=(12.6, 6.6)); ax.set_xlim(0, 12.6); ax.set_ylim(0, 6.8); ax.axis("off")
ax.text(6.3, 6.35, "雷内的每一个「救世」动作，在方程里的实际效果", ha="center", fontsize=13, color=NAVY, fontweight="bold")
rows = [
    ("建格式塔，收拢众生意志", "大规模执行密合", "D 加速下降", RED),
    ("逆转密合之约印，解封胎海", "把汇（吸引子）打开得更快", "D 加速下降", RED),
    ("提炼卡特意志、溶解自我", "把人格也并入密合", "D 加速下降", RED),
    ("自封「新宇宙秩序」", "想成为不动点本身", "造不出有差别的宇宙", ORANGE),
    ("圣剑切削众生意志（外力）", "撤销他加速的那次密合", "衰减率回到基线", TEAL),
]
for i, (act, mech, eff, col) in enumerate(rows):
    y = 5.35 - i*1.02
    ax.add_patch(FancyBboxPatch((0.35, y-0.36), 4.35, 0.72, boxstyle="round,pad=0.05,rounding_size=0.14", fc="#FFFFFF", ec=NAVY, lw=1.3))
    ax.text(0.62, y, act, ha="left", va="center", fontsize=9.8, color=NAVY)
    ax.add_patch(FancyArrowPatch((4.78, y), (5.28, y), arrowstyle="-|>", lw=1.8, color=GREY, mutation_scale=14))
    ax.add_patch(FancyBboxPatch((5.35, y-0.36), 3.30, 0.72, boxstyle="round,pad=0.05,rounding_size=0.14", fc="#F7FAFC", ec=GREY, lw=1.2))
    ax.text(5.60, y, mech, ha="left", va="center", fontsize=9.8, color=NAVY)
    ax.add_patch(FancyArrowPatch((8.72, y), (9.22, y), arrowstyle="-|>", lw=1.8, color=GREY, mutation_scale=14))
    ax.add_patch(FancyBboxPatch((9.29, y-0.36), 2.95, 0.72, boxstyle="round,pad=0.05,rounding_size=0.14", fc=col, ec="none"))
    ax.text(10.76, y, eff, ha="center", va="center", fontsize=9.8, color="white", fontweight="bold")
ax.text(6.3, 0.30, "结论：救世主的方法，是灾难的加速版。", ha="center", fontsize=12, color=RED, fontweight="bold")
save(fig, "fig30-rene-audit.png")

# ---------- 图13 使用教程流程 ----------
fig, ax = plt.subplots(figsize=(13, 6.4)); ax.set_xlim(0, 13); ax.set_ylim(0, 6.6); ax.axis("off")
steps = [
    ("①", "划定系统边界", "这个问题里的「世界」\n边界在哪？", BLUE),
    ("②", "找出初始项", "哪些量在起点就被\n填死了？", TEAL),
    ("③", "判断算子类型", "密合是「生成型」\n还是「坍缩型」？", GOLD),
    ("④", "查内源", "系统内部还有没有\n产生差别的源？", ORANGE),
    ("⑤", "推演终末", "反复迭代，看它\n收敛到哪一点", RED),
    ("⑥", "定位变量", "要改结果，必须\n从哪里注入差别？", PURPLE),
]
for i, (num, t, d, col) in enumerate(steps):
    x = 0.45 + i*2.12
    ax.add_patch(FancyBboxPatch((x, 2.55), 1.86, 3.25, boxstyle="round,pad=0.07,rounding_size=0.18", fc=col, ec="none", alpha=0.14))
    ax.add_patch(Circle((x+0.93, 5.42), 0.36, color=col, zorder=4))
    ax.text(x+0.93, 5.42, num, ha="center", va="center", color="white", fontsize=13, fontweight="bold", zorder=5)
    ax.text(x+0.93, 4.72, t, ha="center", va="center", fontsize=11, color=NAVY, fontweight="bold")
    ax.text(x+0.93, 3.72, d, ha="center", va="center", fontsize=8.6, color=GREY)
    if i < 5:
        ax.add_patch(FancyArrowPatch((x+1.90, 4.15), (x+2.09, 4.15), arrowstyle="-|>", lw=2.4, color=NAVY, mutation_scale=17))
ax.add_patch(FancyBboxPatch((1.2, 0.55), 10.6, 1.35, boxstyle="round,pad=0.10,rounding_size=0.2", fc="#F7FAFC", ec=TEAL, lw=1.6))
ax.text(6.5, 1.22, "口诀：先划边界 → 再定算子 → 后查内源。三步定完，终末就已经写好了。", ha="center", fontsize=11.5, color=NAVY)
ax.text(6.5, 0.22, "图 14　世界式使用教程：六步流程", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig14-tutorial.png")

# ---------- 图14 判别树 ----------
fig, ax = plt.subplots(figsize=(12.6, 7.4)); ax.set_xlim(0, 12.6); ax.set_ylim(0, 7.6); ax.axis("off")
def node(x, y, w, h, t, col, tc="white", fs=10):
    ax.add_patch(FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.06,rounding_size=0.16", fc=col, ec="none"))
    ax.text(x, y, t, ha="center", va="center", fontsize=fs, color=tc, fontweight="bold" if tc == "white" else "normal")
def edge(x1, y1, x2, y2, lab, lx, ly, col):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", lw=1.9, color=col, mutation_scale=15))
    ax.text(lx, ly, lab, fontsize=9.4, color=col, fontweight="bold")
node(6.3, 7.0, 4.6, 0.80, "这个方案，是不是在「合并差别」？", NAVY)
node(3.0, 5.5, 3.6, 0.78, "它是否要求众生意志趋同？", GOLD, "white", 9.6)
node(9.6, 5.5, 3.6, 0.78, "它是否消除了多种可能？", GOLD, "white", 9.6)
edge(5.0, 6.6, 3.7, 5.9, "是", 4.1, 6.35, GOLD); edge(7.6, 6.6, 8.9, 5.9, "是", 8.5, 6.35, GOLD)
node(1.4, 3.9, 2.7, 0.72, "在加速终末", RED, "white", 10.5)
node(4.6, 3.9, 2.7, 0.72, "要看它的动机", ORANGE, "white", 9.6)
node(8.0, 3.9, 2.7, 0.72, "在加速终末", RED, "white", 10.5)
node(11.2, 3.9, 2.7, 0.72, "危害较小", TEAL, "white", 10.5)
edge(2.2, 5.1, 1.6, 4.3, "", 0, 0, RED); edge(3.6, 5.1, 4.4, 4.3, "否", 3.9, 4.78, GREY)
edge(9.0, 5.1, 8.2, 4.3, "是", 8.5, 4.78, RED); edge(10.4, 5.1, 11.0, 4.3, "否", 10.9, 4.78, GREY)
ax.add_patch(FancyBboxPatch((2.6, 1.25), 7.4, 1.55, boxstyle="round,pad=0.12,rounding_size=0.2", fc="#FFF6F6", ec=RED, lw=1.8))
ax.text(6.3, 2.35, "判据：不问动机，只问方向。", ha="center", fontsize=11.6, color=RED, fontweight="bold")
ax.text(6.3, 1.68, "一个方案只要在数学上做「密合」，无论它自称救世还是治愈，\n都会让 D 下降得更快——雷内的格式塔就是最典型的例子。", ha="center", fontsize=9.8, color=NAVY)
ax.text(6.3, 0.5, "图 15　判别树：这个方案在加速终末吗？", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig15-decisiontree.png")

# ---------- 图15 案例时间线 ----------
fig, ax = plt.subplots(figsize=(13, 5.0)); ax.set_xlim(-0.6, 12.6); ax.set_ylim(-2.5, 3.2); ax.axis("off")
ax.annotate("", xy=(12.4, 0), xytext=(-0.3, 0), arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=2.4))
cases = [
    (1.2, 1, "案例一\n雷内的世界式", "从坎瑞亚记录反推\n算出恒定终末", TEAL),
    (4.0, -1, "案例二\n法图纳的失效", "古教团以为循环\n实际源项已归零", BLUE),
    (6.8, 1, "案例三\n圣剑为何有效", "不是杀他\n是撤销那次密合", GOLD),
    (9.6, -1, "案例四\n变量为何是降临者", "改写的是初始项\n不是算子", PURPLE),
]
for x, side, t, d, col in cases:
    ax.add_patch(Circle((x, 0), 0.17, color=col, zorder=4))
    ax.plot([x, x], [0, side*1.05], color=col, lw=1.6)
    ax.add_patch(FancyBboxPatch((x-1.42, side*1.05 - (0.62 if side > 0 else 0.02)), 2.84, 1.30,
                 boxstyle="round,pad=0.07,rounding_size=0.16", fc=col, ec="none", alpha=0.92))
    ty = side*1.05 + (0.62 if side > 0 else 0.62)
    ax.text(x, ty+0.24, t, ha="center", va="center", fontsize=9.8, color="white", fontweight="bold")
    ax.text(x, ty-0.28, d, ha="center", va="center", fontsize=8.2, color="white")
ax.text(6.0, -2.25, "图 12　四个推理案例：每个都只用「差别度 + 算子 + 内源」三件事就推完了", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig12-cases.png")

# ---------- 图16 概念关系图 ----------
fig, ax = plt.subplots(figsize=(12, 7.4)); ax.set_xlim(0, 12); ax.set_ylim(0, 7.6); ax.axis("off")
nodes = {
    "差别度 D": (6.0, 3.9, NAVY, 1.55, 0.86),
    "密合 ⊕": (3.0, 5.9, GOLD, 1.35, 0.80),
    "自指递归": (9.0, 5.9, BLUE, 1.45, 0.80),
    "法图纳\n(开放解)": (2.0, 2.4, TEAL, 1.60, 0.95),
    "世界式\n(封闭解)": (6.0, 1.5, RED, 1.70, 0.95),
    "四象限": (10.0, 3.9, PURPLE, 1.40, 0.80),
    "原始胎海\nD = 0": (10.0, 1.5, "#4B3F72", 1.75, 0.95),
    "降临者": (3.4, 0.9, "#7B4B94", 1.35, 0.80),
}
for t, (x, y, c, w, h) in nodes.items():
    ax.add_patch(FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.06,rounding_size=0.18", fc=c, ec="none"))
    ax.text(x, y, t, ha="center", va="center", fontsize=10.2, color="white", fontweight="bold")
def link(a, b, lab, rad=0.0, col=GREY, off=(0, 0)):
    x1, y1 = nodes[a][0], nodes[a][1]; x2, y2 = nodes[b][0], nodes[b][1]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), connectionstyle="arc3,rad=%.2f" % rad,
                 arrowstyle="-|>", lw=1.7, color=col, mutation_scale=14, zorder=1))
    if lab: ax.text((x1+x2)/2+off[0], (y1+y2)/2+off[1], lab, fontsize=8.8, color=col, ha="center")
link("密合 ⊕", "差别度 D", "作用于", 0.10)
link("自指递归", "差别度 D", "驱动", -0.10)
link("差别度 D", "法图纳", "外源存在时\n→ 循环", 0.12, TEAL)
link("差别度 D", "世界式", "外源归零后\n→ 坍缩", -0.10, RED)
link("世界式", "原始胎海\nD = 0", "唯一吸引子", 0.0, "#4B3F72")
link("差别度 D", "四象限", "分布在", 0.10, PURPLE)
link("降临者", "世界式", "改写初始项", -0.18, "#7B4B94")
link("法图纳", "降临者", "同为外源", 0.0, GREY)
ax.text(6.0, 0.18, "图 11　概念关系图：世界式在整套术语里的位置", ha="center", fontsize=10.5, color=GREY)
save(fig, "fig11-conceptmap.png")
print("第3批完成")
