# -*- coding: utf-8 -*-
"""补论五插图：两种「失去」的对比 + 四象限对照"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle, Rectangle
import numpy as np, os
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
plt.rcParams["axes.unicode_minus"] = False
OUT = os.path.dirname(os.path.abspath(__file__))
NAVY, TEAL, GOLD, RED, BLUE, GREY, PURPLE, ORANGE = "#16324F", "#2A9D8F", "#C9A227", "#A63A50", "#3D7EA6", "#5C6B73", "#8E7DBE", "#E76F51"
def save(fig, n):
    fig.savefig(os.path.join(OUT, "figures", n), dpi=190, bbox_inches="tight", facecolor="white"); plt.close(fig); print("wrote", n)

# ---------- 图25：密合 vs 隔绝 ----------
fig, axes = plt.subplots(1, 2, figsize=(13.0, 5.8))
ax = axes[0]
ax.set_xlim(0, 10); ax.set_ylim(0, 7.2); ax.axis("off")
ax.set_title("密合（同化）：白淞镇", fontsize=13, color=RED, pad=8)
ax.add_patch(Circle((2.6, 4.4), 1.25, color=TEAL, alpha=0.85, zorder=3))
ax.add_patch(Circle((4.5, 4.4), 1.25, color=GOLD, alpha=0.85, zorder=3))
ax.text(3.55, 6.25, "两样可区分的东西\nD = 2", ha="center", fontsize=10, color=NAVY)
ax.add_patch(FancyArrowPatch((5.9, 4.4), (6.9, 4.4), arrowstyle="-|>", lw=2.6, color=RED, mutation_scale=22))
ax.add_patch(Circle((8.3, 4.4), 1.35, color="#7A5C8A", alpha=0.95, zorder=3))
ax.text(8.3, 4.4, "一", ha="center", va="center", fontsize=20, color="white", fontweight="bold", zorder=4)
ax.text(8.3, 6.25, "合成一个\nD = 1", ha="center", fontsize=10, color=NAVY)
ax.add_patch(FancyBboxPatch((1.0, 1.05), 8.0, 1.30, boxstyle="round,pad=0.10,rounding_size=0.18", fc="#FDECEC", ec=RED, lw=1.8))
ax.text(5.0, 1.70, "D 真的减少了 → 账上扣了 → 不可逆", ha="center", va="center", fontsize=11.5, color=RED, fontweight="bold")
ax.text(5.0, 0.35, "归于原始胎海，即 3.3 节的 D → 0 过程", ha="center", fontsize=9.6, color=GREY)
ax = axes[1]
ax.set_xlim(0, 10); ax.set_ylim(0, 7.2); ax.axis("off")
ax.set_title("隔绝（蛋壳）：哥伦比娅", fontsize=13, color=TEAL, pad=8)
ax.add_patch(Circle((2.6, 4.4), 1.25, color=GOLD, alpha=0.85, zorder=3))
ax.text(2.6, 4.4, "霜月", ha="center", va="center", fontsize=11, color="#4A3600", fontweight="bold", zorder=4)
ax.add_patch(Rectangle((5.0, 2.5), 0.42, 3.9, color=GREY, alpha=0.9, zorder=4))
ax.text(5.21, 2.42, "│", ha="center", fontsize=9, color=GREY)
ax.text(5.21, 2.05, "谎言的帷幕（蛋壳）", ha="center", va="top", fontsize=9.4, color=GREY)
ax.add_patch(Circle((7.7, 4.4), 1.25, color=BLUE, alpha=0.85, zorder=3))
ax.text(7.7, 4.4, "哥伦比娅", ha="center", va="center", fontsize=10, color="white", fontweight="bold", zorder=4)
ax.add_patch(FancyArrowPatch((3.95, 4.4), (6.5, 4.4), arrowstyle="<->", lw=2.2, color=GOLD, mutation_scale=18, ls="--", zorder=2))
ax.text(5.21, 3.95, "引力仍在\n（「霜月在唤她回家」）", ha="center", fontsize=9.0, color="#7A5C00", zorder=5,
        bbox=dict(fc="white", ec="none", alpha=0.85, pad=1.2))
ax.text(5.0, 6.55, "两样可区分的东西　D 仍是 2", ha="center", fontsize=10, color=NAVY)
ax.add_patch(FancyBboxPatch((1.0, 1.05), 8.0, 1.30, boxstyle="round,pad=0.10,rounding_size=0.18", fc="#EAF7F4", ec=TEAL, lw=1.8))
ax.text(5.0, 1.70, "D 一点没动 → 账上没扣 → 可逆", ha="center", va="center", fontsize=11.5, color="#1B6B62", fontweight="bold")
ax.text(5.0, 0.35, "失去的不是存在，是通路", ha="center", fontsize=9.6, color=GREY)
fig.suptitle("图 25　世界式里两种完全不同的「失去」", fontsize=13.5, color=NAVY, y=1.00)
save(fig, "fig24-two-kinds-of-loss.png")

# ---------- 图26：四象限对照 ----------
fig, axes = plt.subplots(1, 2, figsize=(12.4, 6.4))
info = [
    ("哥伦比娅：四格俱在", [("记忆", "霜月的歌声\n保存在她体内", BLUE), ("灵魂", "月神\n本质从未改变", PURPLE),
                          ("愿望", "「霜月在唤她回家」\n方向从未丢失", GOLD), ("人格", "愚人众第三席「少女」\n一直在场上", ORANGE)], True),
    ("白淞镇：四格俱空", [("记忆", "", GREY), ("灵魂", "", GREY), ("愿望", "", GREY), ("人格", "", GREY)], False),
]
for ax, (title, quads, alive) in zip(axes, info):
    ax.set_xlim(-5.6, 5.6); ax.set_ylim(-5.4, 5.9); ax.axis("off")
    ax.set_title(title, fontsize=13, color=(TEAL if alive else RED), pad=6)
    pos = [(-2.6, 2.6), (2.6, 2.6), (-2.6, -2.6), (2.6, -2.6)]
    for (q, d, col), (x, y) in zip(quads, pos):
        ax.add_patch(FancyBboxPatch((x-2.34, y-2.34), 4.68, 4.68, boxstyle="round,pad=0.07,rounding_size=0.20",
                     fc=col, ec="white", lw=3, alpha=(0.92 if alive else 0.28)))
        ax.text(x, y+0.92, q, ha="center", fontsize=16, color=("white" if alive else "#8A8A8A"), fontweight="bold")
        if d:
            ax.text(x, y-0.62, d, ha="center", va="center", fontsize=8.8, color="white")
        else:
            ax.text(x, y-0.62, "—", ha="center", va="center", fontsize=15, color="#B0B0B0")
    if alive:
        ax.plot([0], [0], marker="*", ms=26, color=RED, zorder=6)
        ax.text(0, -0.42, "十字路", ha="center", fontsize=9.2, color=RED, fontweight="bold", zorder=7)
        ax.text(0, 5.30, "系统无法把她判出去（不可判定位置）", ha="center", fontsize=9.8, color=RED)
    else:
        ax.text(0, 5.30, "没有可恢复的对象", ha="center", fontsize=9.8, color=GREY)
fig.suptitle("图 26　能不能回来，取决于四象限还剩几格", fontsize=13.5, color=NAVY, y=1.00)
save(fig, "fig25-quadrants-compare.png")
print("补论五插图完成")
