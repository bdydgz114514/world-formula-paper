# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
import os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE"
VOID, LAV = "#4B3F72", "#7B4B94"
fig, ax = plt.subplots(figsize=(12, 7.6)); ax.set_xlim(0, 12); ax.set_ylim(0, 7.8); ax.axis("off")
N = {
    "D":   (6.0, 4.0, NAVY, 1.60, 0.86, "差别度 D"),
    "HE":  (2.9, 6.0, GOLD, 1.40, 0.80, "密合 ⊕"),
    "REC": (9.1, 6.0, BLUE, 1.50, 0.80, "自指递归"),
    "FAT": (1.9, 2.5, TEAL, 1.75, 0.98, "法图纳\n(开放解)"),
    "WF":  (6.0, 1.5, RED, 1.85, 0.98, "世界式\n(封闭解)"),
    "QUA": (10.1, 4.0, PURPLE, 1.45, 0.80, "四象限"),
    "VOID":(10.1, 1.5, VOID, 1.85, 0.98, "原始胎海\nD = 0"),
    "DES": (3.2, 0.85, LAV, 1.40, 0.80, "降临者"),
}
for k, (x, y, c, w, h, t) in N.items():
    ax.add_patch(FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.06,rounding_size=0.18", fc=c, ec="none", zorder=3))
    ax.text(x, y, t, ha="center", va="center", fontsize=10.2, color="white", fontweight="bold", zorder=4)
def link(a, b, lab="", rad=0.0, col=GREY, ox=0.0, oy=0.0, lw=1.7, style="-|>"):
    x1, y1 = N[a][0], N[a][1]; x2, y2 = N[b][0], N[b][1]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), connectionstyle="arc3,rad=%.2f" % rad,
                 arrowstyle=style, lw=lw, color=col, mutation_scale=14, zorder=1))
    if lab: ax.text((x1+x2)/2+ox, (y1+y2)/2+oy, lab, fontsize=8.9, color=col, ha="center", va="center", zorder=5,
                    bbox=dict(fc="white", ec="none", alpha=0.85, pad=1.2))
link("HE", "D", "作用于", 0.12, GOLD, 0.35, 0.28)
link("REC", "D", "驱动", -0.12, BLUE, -0.35, 0.28)
link("D", "FAT", "外源存在\n→ 循环", 0.14, TEAL, -0.55, 0.30)
link("D", "WF", "外源归零\n→ 坍缩", -0.12, RED, 0.55, 0.32)
link("WF", "VOID", "唯一吸引子", 0.0, VOID, 0.0, 0.30)
link("D", "QUA", "分布其上", 0.12, PURPLE, 0.62, 0.30)
link("DES", "WF", "改写初始项", -0.22, LAV, -0.95, -0.10)
link("FAT", "DES", "同为「系统外」", 0.0, GREY, 0.0, -0.34, 1.3, "<->")
ax.text(6.0, 0.18, "图 11　概念关系图：世界式在整套术语里的位置", ha="center", fontsize=10.5, color=GREY)
fig.savefig(os.path.join(OUT, "figures", "fig11-conceptmap.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig)
print("wrote fig11-conceptmap.png")
