# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, GREY, ORANGE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#5C6B73", "#E76F51"
fig, ax = plt.subplots(figsize=(13.4, 6.0))
ax.set_xlim(0, 13.4); ax.set_ylim(0, 6.4); ax.axis("off")
rows = [
    ("第一档", "密合",     "两样东西变成一个",       "D 归零，不可逆",       "终末的成因",       RED),
    ("第二档", "归约",     "从合并体里取一个原像",   "D 回升，但有损（δ′＜δ）", "从废墟里捡回几块砖", ORANGE),
    ("第三档", "人格分离", "只剥离其中一个象限",     "D 基本不变，结构可复用", "唯一可持续的一档", TEAL),
]
ax.text(0.30, 6.08, "档", fontsize=12, color=NAVY, fontweight="bold")
ax.text(3.70, 6.08, "它做什么", fontsize=12, color=NAVY, fontweight="bold")
ax.text(7.40, 6.08, "对差别度 D 的作用", fontsize=12, color=NAVY, fontweight="bold")
ax.text(13.05, 6.08, "性质", fontsize=12, color=NAVY, fontweight="bold", ha="right")
for i, (tier, name, what, eff, nature, col) in enumerate(rows):
    y = 4.86 - i*1.50
    ax.add_patch(FancyBboxPatch((0.20, y), 13.0, 1.34, boxstyle="round,pad=0.08,rounding_size=0.18", fc=col, ec="none", alpha=0.11))
    ax.add_patch(FancyBboxPatch((0.20, y), 0.16, 1.34, boxstyle="square,pad=0", fc=col, ec="none"))
    ax.text(0.52, y+0.67, tier, fontsize=10, color=GREY, va="center")
    ax.text(2.05, y+0.67, name, fontsize=16, color=col, fontweight="bold", va="center", ha="center")
    ax.text(3.70, y+0.88, what, fontsize=12.2, color=NAVY, va="center")
    ax.text(3.70, y+0.34, eff, fontsize=10.6, color=GREY, va="center")
    ax.text(13.05, y+0.67, nature, fontsize=11.4, color=col, fontweight="bold", va="center", ha="right")
ax.add_patch(FancyBboxPatch((0.20, 0.30), 13.0, 0.96, boxstyle="round,pad=0.08,rounding_size=0.18", fc="#FFF8E6", ec=GOLD, lw=1.7))
ax.text(6.70, 0.78, "四象限里「灵魂」与「人格」可分开处理 —— 剥掉人格、灵魂回仓库、下次配新人格。这就是轮回。",
        ha="center", va="center", fontsize=11.6, color="#6A4E00")
fig.savefig(os.path.join(OUT, "figures", "fig28-three-operations.png"), dpi=190, bbox_inches="tight", facecolor="white")
plt.close(fig); print("wrote fig29 (重画)")
